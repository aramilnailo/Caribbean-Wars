var debug = require("./debug.js").accounts;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");

/**
 * The accounts namespace contains the functions relating to
 * creating and using accounts
 * @module server/accounts
 */
var Accounts = function() {};
 
/**
* Registers functions in this namespace with the given
* message router.
* @param router - the message router
* @memberof module:server/accounts
*/
Accounts.prototype.listen = function(router) {
	if(debug) log("[Accounts] listen()");
    router.listen("disconnect", this.disconnect);
    router.listen("login", this.login);
    router.listen("signup", this.signup);
    router.listen("userListRequest", this.userListRequest);
    router.listen("logout",this.logout);
    router.listen("mapEditorLogout",this.logout);
    router.listen("deleteAccount",this.deleteAccount);
	router.listen("changeUserType", this.changeUserType);
}
    
//================== FUNCTIONS ========================================
    
    
/**
 * Disconnects the given client from the given client list
 * Emits collapseMenus
 * @param param.client - the client to be removed
 * @param param.clients - the client list that client is to be removed from
 * @memberof module:server/accounts
 */
Accounts.prototype.disconnect = function disconnect(param) {
    if (debug) log("server/accounts.js: disconnect()");
    var client = param.client;
    var clients = param.clients;
   	// Remove the client from any game sessions
	require("./session.js").exitGameSession({client:client});
    // Remove from client list
    var index = clients.indexOf(client);
    if(index > -1) clients.splice(index, 1);
}

/**
 * Verifies the given username, password, and usertype. Assigns
 * data to the client object. Emits proper response.
 * @param param.client - client to be logged in
 * @param param.data.username - client's desired username
 * @param param.data.password - client's given password
 * @param param.data.usertype - client's desired usertype
 * @memberof module:server/accounts
 */
Accounts.prototype.login = function login(param) {
    if(debug) log("[Accounts] login()");
    var client = param.client;
	var uname = param.data.username;
	var type = param.data.usertype;
    // Check info with the database
    dbi.login(uname, param.data.password, function(resp) {
        if(resp) {
        	// If login info is valid, validate the usertype
			if(type === "admin" && uname !== "admin") {
				server.emit(client.socket, "alert", "Can't login as admin");
			} else {
				// Update the usertype
				dbi.setUsertype(uname, type, function(resp) {});
				// Assign data
				client.username = uname;
				client.usertype = type;
				// Transition between menus
            	server.emit(client.socket, "setClientInfo", 
					{username:client.username, usertype:client.usertype});
				if(type === "admin") {
					server.emit(client.socket, "adminScreen", null);
				} else if(type === "editor") {
					server.emit(client.socket, "mapEditorScreen", null);
				} else {
					server.emit(client.socket, "sessionBrowser", null);
				}
		    	if (debug) log("[Accounts] Login success");
			}
        } else {
            // If login info is denied
	    	if (debug) log("[Accounts] Login failure");
            server.emit(client.socket, "alert", "Invalid info");
        }
    });
}

/**
 * Attempts to add a new user
 * @param param.client - client to be put into the game upon successful add
 * @param param.data.username - username to add
 * @param param.data.password - password to add
 * @memberof module:server/accounts
 */
Accounts.prototype.signup = function signup(param) {
    if (debug) log("[Accounts] signup(); user = "+param.data.username + 
		"; usertype = "+param.data.usertype+"; password = "+param.data.password);
    var client = param.client;
    var data = param.data;
	// Validate usertype
    if (data.username !== "admin" && data.usertype === "admin") {
    	server.emit(client.socket, "alert", "Only username \"admin\" can " +
			"be an admin");
    } else {
		// Insert new user into database
		dbi.signup(data.username, data.password, function(resp) {
        	if(resp) {
            	dbi.addUserStats(data.username, function(resp) {});
				dbi.setUsertype(data.username, data.usertype, function(resp) {});
				server.emit(client.socket, "alert", "Signup successful!");
				dbi.getAllUserInfo(function(data) {
					for(var i in param.clients) {
						var c = param.clients[i];
				    	server.emit(c.socket, "userListResponse", data);
					}
				});
        	} else {
        		server.emit(client.socket, "alert", "Signup unsuccessful")
        	}
    	});
	}
}

/**
 * Respond to request for user list
 * Emits userListResponse
 * @param param.client - client sending the request
 * @memberof module:server/accounts
 */
Accounts.prototype.userListRequest = function userListRequest(param) {
    if (debug) log("[Accounts] userListRequest()");
    var client = param.client;
	// Send back the whole table from the database
	dbi.getAllUserInfo(function(data) {
	    server.emit(client.socket, "userListResponse", data);
	});
}

/**
 * Logs the player out without removing the client from the connections list
 * Emits logoutResponse and collapseMenus
 * @param param.client - client to log out
 * @memberof module:server/accounts
 */
Accounts.prototype.logout = function logout(param) {
    if (debug) log("[Accounts] logout()");
    var client = param.client;
	client.username = "";
	client.usertype = "";
	server.emit(client.socket, "loginScreen", null);
}

/**
 * Deletes the account currently logged into by the client, sends client to log in screen
 * Emits logoutResponse and collapseMenus
 * @param param.client - client to remove account
 * @memberof module:server/accounts
 */
Accounts.prototype.deleteAccount = function deleteAccount(param) {
    if (debug) log("[Accounts] deleteAccount()");
	// Find the client with the username param.data
    var current, client;
	for(var i in param.clients) {
		current = param.clients[i];
		if(current.username === param.data) {
			client = current;
			break;
		}
	}
	dbi.removeUserStats(param.data, function(resp) {
	if(resp) {
	dbi.removeUser(param.data, function(val) {
	if(val) {
		if(client) {
			require("./session.js").exitGameSession({client:client});
			client.username = "";
			client.usertype = "";
			server.emit(client.socket, "loginScreen", null);
			server.emit(client.socket, "alert", "Your account has been deleted.");
		}
		if(param.client !== client) server.emit(param.client.socket, "alert", "Account deleted.");
		dbi.getAllUserInfo(function(data) {
			for(var i in param.clients) {
				var c = param.clients[i];
		    	server.emit(c.socket, "userListResponse", data);
			}
		});
	} else {
		server.emit(param.client.socket, "alert", "Could not delete account");
	}
	});
	} else {
		server.emit(param.client.socket, "alert", "Could not delete account");
	}
	});
}

Accounts.prototype.changeUserType = function(param) {
	var username = param.data.username;
	var type = param.data.type;
	// Find the client with that username, if any
    var client = param.clients.find(function (c) {
    	return c.username === username;
    });
	dbi.setUsertype(username, type, function(resp) {
		if(resp) {
			server.emit(param.client.socket, "alert", "Type change successful.");
			// Change the type on the server
			if(client) {
				server.emit(client.socket, "alert", "Your type is now \"" + type + "\"");
				client.usertype = type;
				// Exit game
				require("./session.js").exitGameSession({client:client});
				// Change screens
				server.emit(client.socket, "setClientInfo", {username:client.username, 
					usertype:client.usertype});
				if(type === "admin") {
					server.emit(client.socket, "adminScreen", null);
				} else if(type === "editor") {
					server.emit(client.socket, "mapEditorScreen", null);
				} else {
					server.emit(client.socket, "sessionBrowser", null);
				}
			}
			dbi.getAllUserInfo(function(data) {
				for(var i in param.clients) {
					var c = param.clients[i];
			    	server.emit(c.socket, "userListResponse", data);
				}
			});
		} else {
			server.emit(param.client.socket, "alert", "Could not change type.");
		}
	});
}

module.exports = new Accounts();

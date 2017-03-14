var debug = require("./debug.js").accounts;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");
var player = require("./player.js");
var session = require("./session.js");

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
    if (debug) log("server/accounts.js: listen()");
    router.listen("disconnect", this.disconnect);
    router.listen("login", this.login);
    router.listen("signup", this.signup);
    router.listen("userListRequest", this.userListRequest);
    router.listen("logout",this.logout);
    router.listen("mapEditorLogout",this.logout);
    router.listen("deleteAccount",this.deleteAccount);
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
   // If in a game, remove the player
    if(client.player !== null) {
        session.exitGameSession(client.player);
    }
    server.emit(client.socket, "collapseMenus", null);
    // Remove from client list
    var index = clients.indexOf(client);
    if(index > -1) clients.splice(index, 1);
}
    
// Client clicked login button
/**
 * Logs the given client in
 * Emits loginResponse and collapseMenus
 * @param param.client - client to be logged in
 * @param param.data.username - username to attempt to log in with
 * @param param.data.password - password to attempt to log in with
 * @memberof module:server/accounts
 */
Accounts.prototype.login = function login(param) {
    if (debug) log("server/accounts.js: login()");
    var client = param.client;
    var data = param.data;
    // Check info with the database
    dbi.login(data.username, data.usertype, data.password, function(resp) {
        if(resp) {
            // If login info is valid, give the client a player
            client.player = player.Player(data.username,data.usertype);
	    if (debug) log("server/accounts.js: login(): success; client.player="+client.player);

            // The player joins the game
	    if (data.usertype === "player" || data.usertype === "host")
		session.enterGameSession(client.player);
            server.emit(client.socket, "loginResponse", {success:true,
							 username:data.username,
							 usertype:data.usertype});
            server.emit(client.socket, "collapseMenus", null);
	    if (debug) log("server/accounts.js: login success");
        } else {
            // If login info is denied
	    if (debug) log("server/accounts.js: login failure");
            server.emit(client.socket, "loginResponse", {success:false});
        }
    });
}
/**
 * Attempts to add a new user
 * Emits loginResponse and collapseMenus
 * @param param.client - client to be put into the game upon successful add
 * @param param.data.username - username to add
 * @param param.data.password - password to add
 * @memberof module:server/accounts
 */
Accounts.prototype.signup = function signup(param) {
    if (debug) log("server/accounts.js: signup(); user = "+param.data.username + "; usertype = "+param.data.usertype+"; password = "+param.data.password);
    var client = param.client;
    var data = param.data;
    // Create new record in database
    var permission = false;
    if (data.usertype != "admin" || data.username == "admin") permission = true;
    if (permission) {
    dbi.signup(data.username, data.usertype, data.password, function(resp) {
        if(resp) {
            // If info is valid, give the client a player
            client.player = player.Player(data.username,data.usertype);
            session.enterGameSession(client.player);
            dbi.addUserStats(client.player.username, function(resp) {});
            server.emit(client.socket, "loginResponse", {success:true,
							 username:data.username,
							 usertype:data.usertype});
            server.emit(client.socket, "collapseMenus", null);
        } else {
            // If duplicate username, etc.
            server.emit(client.socket, "loginResponse", {success:false});
        }
    });
    } else {
	server.emit(client.socket,"adminAccessRequired",null);
    }
}

/**
 * Respond to request for user list
 * Emits userListResponse
 * @param param.client - client sending the request
 * @memberof module:server/accounts
 */
Accounts.prototype.userListRequest = function userListRequest(param) {
    if (debug) log("server/accounts.js: userListRequest()");
    var client = param.client;
    if (param.data.usertype == "admin" ) {
	// Send back the whole table from the database
	dbi.getAllUserInfo(function(data) {
	    server.emit(client.socket, "userListResponse", data);
	});
    } else {
	server.emit(client.socket, "adminAccessRequired", null);
    }
}

// Clicked logout
/**
 * Logs the player out without removing the client from the connections list
 * Emits logoutResponse and collapseMenus
 * @param param.client - client to log out
 * @memberof module:server/accounts
 */
Accounts.prototype.logout = function logout(param) {
    if (debug) log("server/accounts.js: logout()");
    var client = param.client;
	// Remove from the game session, but don't remove the client
	if(client.player) {
	    session.exitGameSession(client.player);
	    client.player = null;
	}
	server.emit(client.socket, "logoutResponse", null);
	server.emit(client.socket, "collapseMenus", null);
}

    // Clicked delete account
/**
 * Deletes the account currently logged into by the client, sends client to log in screen
 * Emits logoutResponse and collapseMenus
 * @param param.client - client to remove account
 * @memberof module:server/accounts
 */
Accounts.prototype.deleteAccount = function deleteAccount(param) {
    if (debug) log("server/accounts.js: deleteAccount()");
    var client = param.client;
    //if (client.player.usertype == "admin" ) {
	if(client.player) {
	    dbi.removeUserStats(client.player.username,
				function(val) {});
	    dbi.removeUser(client.player.username,
			   function(resp) {});
	    session.exitGameSession(client.player);
	    client.player = null;
	}
	server.emit(client.socket, "logoutResponse", null);
    server.emit(client.socket, "collapseMenus", null);
    /*
    } else {
	server.emit(client.socket, "adminAccessRequired", null);
    }
*/
    
}

module.exports = new Accounts();

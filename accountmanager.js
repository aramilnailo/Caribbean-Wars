
var debug = require("./debug.js").accountmanager;
var log = require("./debug.js").log;

var dbi = require("./dbi.js");
var player = require("./player.js");
var gameSessions = require("./gamesessions.js");

var Accountmanager = function() {};
 
Accountmanager.prototype.listen = function(sox) {
    sox.listen("disconnect", this.disconnect);
    sox.listen("login", this.login);
    sox.listen("signup", this.signup);
    sox.listen("userListRequest", this.userListRequest);
    sox.listen("logout",this.logout);
    sox.listen("deleteAccount",this.deleteAccount);
}
    
//================== FUNCTIONS ========================================
    
    
// Client closed the window, network issue, etc.
Accountmanager.prototype.disconnect = function disconnect(param) {
    var client = param.client;
    var clients = param.clients;
   // If in a game, remove the player
    if(client.player !== null) {
        exitGameSession(client.player);
    }
    client.socket.emit("collapseMenus");
    // Remove from client list
    var index = clients.indexOf(client);
    if(index > -1) clients.splice(index, 1);
}
    
// Client clicked login button
Accountmanager.prototype.login = function login(param) {
    if (debug) log("call to login");
    var client = param.client;
    var data = param.data;
    // Check info with the database
    dbi.login(data.username, data.password, function(resp) {
        if(resp) {
            // If login info is valid, give the client a player
            client.player = player.Player(data.username);
            // The player joins the game
            gameSessions.enterGameSession(client.player);
            client.socket.emit("loginResponse", {success:true,
                              username:data.username});
            client.socket.emit("collapseMenus");
        } else {
            // If login info is denied
            client.socket.emit("loginResponse", {success:false});
        }
    });
}

Accountmanager.prototype.signup = function signup(param) {
    if (debug) log("accountmanager: call to signup; user = "+param.data.username + "; password = "+param.data.password);
    var client = param.client;
    var data = param.data;
    // Create new record in database
    dbi.signup(data.username, data.password, function(resp) {
        if(resp) {
            // If info is valid, give the client a player
            client.player = player.Player(data.username);
            gameSessions.enterGameSession(client.player);
            dbi.addUserStats(client.player.username, function(resp) {});
            client.socket.emit("loginResponse", {success:true,
                              username:data.username});
            client.socket.emit("collapseMenus");
        } else {
            // If duplicate username, etc.
            client.socket.emit("loginResponse", {success:false});
        }
    });
}
    
Accountmanager.prototype.userListRequest = function userListRequest(param) {
    var client = param.client;
	// Send back the whole table from the database
	dbi.getAllUserInfo(function(data) {
	    client.socket.emit("userListResponse", data);
	});
}

// Clicked logout
Accountmanager.prototype.logout = function logout(param) {
    var client = param.client;
	// Remove from the game session, but don't remove the client
	if(client.player) {
	    gameSessions.exitGameSession(client.player);
	    client.player = null;
	}
	client.socket.emit("logoutResponse");
	client.socket.emit("collapseMenus");
}

    // Clicked delete account
Accountmanager.prototype.deleteAccount = function deleteAccount(param) {
    var client = param.client;
	if(client.player) {
	    dbi.removeUserStats(client.player.username, function(val) {});
	    dbi.removeUser(client.player.username, function(resp) {
            
	    });
	    gameSessions.exitGameSession(client.player);
	    client.player = null;
	}
	client.socket.emit("logoutResponse");
	client.socket.emit("collapseMenus");
}

module.exports = new Accountmanager();

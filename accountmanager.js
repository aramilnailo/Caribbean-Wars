
var dbi = require("./dbi.js");

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
   // If in a game, remove the player
    if(client.player !== null) {
        exitGameSession(client.player);
    }
    client.socket.emit("collapseMenus");
    // Remove from client list
    var index = CLIENT_LIST.indexOf(client);
    if(index > -1) CLIENT_LIST.splice(index, 1);
}
    
// Client clicked login button
Accountmanager.prototype.login = function login(param) {
    console.log("call to login");
    var client = param.client;
    var data = param.data;
    // Check info with the database
    dbi.login(data.username, data.password, function(resp) {
        if(resp) {
            // If login info is valid, give the client a player
            client.player = player.Player(data.username);
            // The player joins the game
            enterGameSession(client.player);
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
    console.log("call to signup");
    if (param) console.log("dbi.signup: param def'd");
    if (param.data) console.log("dbi.signup: param.data def'd");
    var client = param.client;
    var data = param.data;
    // Create new record in database
    if (data) console.log("dbi.signup: data def'd");
    if (data.username) console.log("dbi.signup: data.username = "+data.username);
    if (data.password) console.log("dbi.signup: data.password = "+data.password);
	
    dbi.signup(data.username, data.password, function(resp) {
        if(resp) {
            // If info is valid, give the client a player
            client.player = player.Player(data.username);
            enterGameSession(client.player);
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
	    exitGameSession(client.player);
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
	    exitGameSession(client.player);
	    client.player = null;
	}
	client.socket.emit("logoutResponse");
	client.socket.emit("collapseMenus");
}

module.exports = new Accountmanager();

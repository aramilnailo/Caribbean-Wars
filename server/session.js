
var debug = require("./debug.js").session;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");

/**
* The session namespace controls the current game session
* -- the list of players, the current map, and the current
* host player.
*/
var Session = function() {};

/**
* Registers functions in this namespace with the given
* message router.
* @param router - the message router
*/
Session.prototype.listen = function(router) {
    router.listen("endGameSession", this.endGameSession);
    router.listen("exitGameSession", this.exitGameSession);
    router.listen("enterGameSession", this.enterGameSession);
}

/**
* Game session object: host, map file path, and list of players.
*/
var GAME_SESSION = {host:null, map:"", players:[]};

/**
* Resets the game session object and ejects all players
* to their login screen.
* @param data - the data passed by the caller
* @param data.clients - client list
*/
Session.prototype.endGameSession = function(data) {
    // Reset the object
    GAME_SESSION.host = null;
    GAME_SESSION.map = "";
    // Set everyone offline
    for(i in GAME_SESSION.players) {
	dbi.setUserOnlineStatus(GAME_SESSION.players[i].username, false);
    }
    // Null out the player list
    GAME_SESSION.players = [];
    // Log everyone out
    var CLIENT_LIST = data.clients;
    for(i in CLIENT_LIST) {
		CLIENT_LIST[i].player = null;
		server.emit(CLIENT_LIST[i].socket, "logoutResponse", null);
		server.emit(CLIENT_LIST[i].socket, "collapseMenus", null);
    }
}

/**
* Removes a given player from the game session. Ends
* the game session if the player is host.
* @param data - the player to remove
*/
Session.prototype.exitGameSession = function (data) {
    // Remove the player from the game session list
    index = GAME_SESSION.players.indexOf(data);
    if(index > -1) GAME_SESSION.players.splice(index, 1);
    // Turn the player offline in the database
    dbi.setUserOnlineStatus(data.username, false);
    // If the host leaves, it's game over for everyone
    if(data === GAME_SESSION.host) this.endGameSession(data);
}

/**
* Adds a given player to the game session. Player is
* made host if they are the first to be added.
* @param data - the player to be added
*/
Session.prototype.enterGameSession = function(data) {
    // If no one is online, the player becomes host
    if(GAME_SESSION.players.length == 0) {
	GAME_SESSION.host = data;
    }
    // Add player to game session list
    GAME_SESSION.players.push(data);
    // Turn the player online in the database
    dbi.setUserOnlineStatus(data.username, true);
}

module.exports = new Session();
module.exports.GAME_SESSION = GAME_SESSION;

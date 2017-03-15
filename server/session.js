
var debug = require("./debug.js").session;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");

/**
* The session namespace controls the current game session
* -- the list of players, the current map, and the current
* host player.
* @module server/Session
*/
var Session = function() {};

/**
* Registers functions in this namespace with the given
* message router.
* @param router - the message router
* @memberof module:server/Session
*/
Session.prototype.listen = function(router) {
    if(debug) log("server/session.js: listen()");
    router.listen("endGameSession", this.endGameSession);
    router.listen("exitGameSession", this.exitGameSession);
    router.listen("enterGameSession", this.enterGameSession);
}

/**
* Game session object: host, map file path, and list of players.
* @memberof module:server/Session
*/
var GAME_SESSION = {host:null, map:"", players:[]};

/**
* Resets the game session object and ejects all players
* to their login screen.
* @param data - the data passed by the caller
* @param data.clients - client list
* @memberof module:server/Session
*/
Session.prototype.endGameSession = function() {
    if(debug) log("server/session.js: endGameSession()");
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
    var CLIENT_LIST = require("./router.js").client_list;
    for(i in CLIENT_LIST) {
		if(CLIENT_LIST[i].player) {
			CLIENT_LIST[i].player = null;
			server.emit(CLIENT_LIST[i].socket, "logoutResponse", null);
			server.emit(CLIENT_LIST[i].socket, "collapseMenus", null);
		}
    }
}

/**
* Removes a given player from the game session. Ends
* the game session if the player is host.
* @param data - the client whose player to remove
* @memberof module:server/Session
*/
Session.prototype.exitGameSession = function(data) {
    if(debug) log("server/session.js: exitGameSession()");
    // Remove the player from the game session list
    var index = GAME_SESSION.players.indexOf(data);
    if(index > -1) GAME_SESSION.players.splice(index, 1);
    // Turn the player offline in the database
    dbi.setUserOnlineStatus(data.username, false);
    // If the host leaves, it's game over for everyone
    if(data === GAME_SESSION.host) {
		this.endGameSession();
	}
}

/**
* Adds a given player to the game session. Player is
* made host if they are the first to be added.
* @param data - the player to be added
* @memberof module:server/Session
*/
Session.prototype.enterGameSession = function(data) {
    if(debug) log("server/session.js: enterGameSession()");
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

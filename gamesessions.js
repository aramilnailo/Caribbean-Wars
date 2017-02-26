
var debug = require("./debug.js").gamesessions;
var log = require("./debug.js").log;

var dbi = require("./dbi.js");

var GameSessions = function() {};

GameSessions.prototype.listen = function(sox) {
    sox.listen("endGameSession", this.endGameSession);
    sox.listen("exitGameSession", this.exitGameSession);
    sox.listen("enterGameSession", this.enterGameSession);
}

var GAME_SESSION = {host:null, map:"", players:[]};

GameSessions.prototype.endGameSession = function(data) {
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
	CLIENT_LIST[i].socket.emit("logoutResponse");
	CLIENT_LIST[i].socket.emit("collapseMenus");
    }
}

GameSessions.prototype.exitGameSession = function (data) {
    // Remove the player from the game session list
    index = GAME_SESSION.players.indexOf(data);
    if(index > -1) GAME_SESSION.players.splice(index, 1);
    // Turn the player offline in the database
    dbi.setUserOnlineStatus(data.username, false);
    // If the host leaves, it's game over for everyone
    if(data === GAME_SESSION.host) this.endGameSession(data);
}

GameSessions.prototype.enterGameSession = function(data) {
    // If no one is online, the player becomes host
    if(GAME_SESSION.players.length == 0) {
	GAME_SESSION.host = data;
    }
    // Add player to game session list
    GAME_SESSION.players.push(data);
    // Turn the player online in the database
    dbi.setUserOnlineStatus(data.username, true);
}

module.exports = new GameSessions();
module.exports.GAME_SESSION = GAME_SESSION;


var debug = require("./debug.js").session;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");
var files = require("./files.js");
var player = require("./player.js");

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
	router.listen("newGameSession", this.newGameSession);
    router.listen("endGameSession", this.endGameSession);
	router.listen("beginGameSession", this.beginGameSession);
    router.listen("exitGameSession", this.exitGameSession);
    router.listen("enterGameSession", this.enterGameSession);
	router.listen("sessionListRequest", this.sessionListRequest);
    router.listen("getGameMap", this.getGameMap);
	router.listen("loadNewMap",this.loadNewGameMap);
}

/**
* Game session object: host, map file path, and list of players.
* @memberof module:server/Session
*/
var GAME_SESSIONS = [];

Session.prototype.newGameSession = function(param) {
	var client = param.client;
	var username = param.data.username;
	var usertype = param.data.usertype;
	var id = GAME_SESSIONS.length;
	// Assign a new player to the client
	client.player = player.Player(username, usertype, id);
	// Create new session with client.player as host
	GAME_SESSIONS[id] = {host:client.player, map:"", players:[client.player]};
    // Turn the player online in the database
    dbi.setUserOnlineStatus(client.player.username, true);
	// Move the player into the game lobby
	server.emit(client.socket, "enterLobby", {isHost:true});
	server.emit(client.socket, "updateLobby", GAME_SESSIONS[id].players);
	server.emit(client.socket, "alert", "You are host of lobby " + id);
	client.player.inLobby = true;
}

/**
* Resets the game session object and ejects all players
* to their login screen.
* @param param - the data passed by the router
* @param param.clients - client list
* @memberof module:server/Session
*/
Session.prototype.endGameSession = function(param) {
    if(debug) log("server/session.js: endGameSession()");
	var clients = param.clients;
	if(!param.client.player) return;
	var id = param.client.player.id;
	log(id);
	var session = GAME_SESSIONS[id];
    // Reset the object
    session.host = null;
    session.map = "";
	// Log everyone out
    for(var i in session.players) {
		var player = session.players[i];
		dbi.setUserOnlineStatus(player.username, false);
		for(var j in clients) {
			if(clients[j].player === player) {
				if(clients[j].player.inLobby) {
					server.emit(clients[j].socket, "exitLobby", null);
				} else if(clients[j].player.inGame) {
					server.emit(clients[j].socket, "logoutResponse", null);
				}
				server.emit(clients[j].socket, "alert", "The game session has ended.");
				clients[j].player = null;
			}
		}
    }
    // Null out the player list
    session.players = [];
	// Remove the session from the sessions list
	var index = GAME_SESSIONS.indexOf(session);
 	GAME_SESSIONS.splice(index, 1);
}

Session.prototype.beginGameSession = function(param) {
	var clients = param.clients;
	var client = param.client;
	if(!client.player) return;
	var id = client.player.id;
	var session = GAME_SESSIONS[id];
	for(var i in session.players) {
		var p = session.players[i];
		for(var j in clients) {
			var pl = clients[j].player;
			var socket = clients[j].socket;
			if(p === pl) {
				p.inLobby = false;
				p.inGame = true;
				server.emit(socket, "enterGame", null);
				server.emit(socket, "alert", "Game started");
			}
		}
	}
}

/**
* Removes a given player from the game session. Ends
* the game session if the player is host.
* @param param - passed by the router
* @param param.client - client whose player to remove
* @memberof module:server/Session
*/
Session.prototype.exitGameSession = function(param) {
	if(debug) log("server/session.js: exitGameSession()");
	var clients = param.clients;
	var client = param.client;
	if(!client.player) return;
	var id = client.player.id;
	var session = GAME_SESSIONS[id];
    // Remove the player from the game session list
    var index = session.players.indexOf(client.player);
    if(index > -1) session.players.splice(index, 1);
    // Turn the player offline in the database
    dbi.setUserOnlineStatus(client.player.username, false);
	// Send the client out of the lobby
	server.emit(client.socket, "exitLobby", null);
	// Update the lobbies of everyone else
	for(var i in GAME_SESSIONS[id].players) {
		var p = GAME_SESSIONS[id].players[i];
		for(var j in clients) {
			var pl = clients[j].player;
			var socket = clients[j].socket;
			if(pl === p) {
				server.emit(socket, "updateLobby", GAME_SESSIONS[id].players);
			}
		}
	}
	server.emit(client.socket, "alert", "You have left lobby " + id);
    // If the host left, it's game over for everyone
    if(client.player === session.host) {
		Session.prototype.endGameSession(
			{client:client,
			clients:require("./router.js").client_list, 
			data:id});
	}
	client.player = null;
}

/**
* Adds a given player to the game session. Player is
* made host if they are the first to be added.
* @param param - data passed by the router
* @param param.client - client to be added to the session
* @memberof module:server/Session
*/
Session.prototype.enterGameSession = function(param) {
    if(debug) log("server/session.js: enterGameSession()");
	var client = param.client;
	var clients = param.clients;
	var username = param.data.username;
	var usertype = param.data.usertype;
	var id = param.data.id;
	if(id >= GAME_SESSIONS.length) {
		server.emit(client.socket, "alert", "No such game session");
		return;
	}
	// Assign a new player to the client
	client.player = player.Player(username, usertype, id);
    // If no one is online, the player becomes host
	var val = false;
    if(GAME_SESSIONS[id].players.length == 0) {
		GAME_SESSIONS[id].host = client.player;
		val = true;
    }
    // Add player to game session list
    GAME_SESSIONS[id].players.push(client.player);
    // Turn the player online in the database
    dbi.setUserOnlineStatus(client.player.username, true);
	// Move the player into the game lobby
	server.emit(client.socket, "enterLobby", {isHost:val});
	for(var i in GAME_SESSIONS[id].players) {
		var p = GAME_SESSIONS[id].players[i];
		for(var j in clients) {
			var pl = clients[j].player;
			var socket = clients[j].socket;
			if(pl === p) {
				server.emit(socket, "updateLobby", GAME_SESSIONS[id].players);
			}
		}
	}
	server.emit(client.socket, "alert", "You have entered lobby " + id);
	client.player.inLobby = true;
}


Session.prototype.sessionListRequest = function(param) {
	var client = param.client;
	server.emit(client.socket, "sessionListResponse", GAME_SESSIONS);
}

/**
* Loads the map data from a given filepath, associates it 
* with the game session, and emits it to all clients.
* @param param - data passed by the router
* @param param.client - client attempting the load
* @param param.data - the username and filename
* @param param.clients - the client list
* @memberof module:server/Session
*/
Session.prototype.loadNewGameMap = function(param) {
    if (debug) log("server: loadNewGameMap()");
    var client = param.client;
    var CLIENT_LIST = param.clients;
    var filename = param.data.filename;
    var username = param.data.username;
	if(!client.player) return;
	var id = client.player.id;
    if(username != GAME_SESSIONS[id].host.username) {
		server.emit(client.socket, "alert", "Only host can load maps.");
    } else {
	dbi.getMapFilePath(filename, function(path) {
	    if(path) {
		files.readFile(path, function(data) {
		    if(data) {
				GAME_SESSIONS[id].map = path;
				for(var i in GAME_SESSIONS[id].players) {
					var p = GAME_SESSIONS[id].players[i];
					for(var j in CLIENT_LIST) {
						var player = CLIENT_LIST[j].player;
						var socket = CLIENT_LIST[j].socket;
						if(p === player) {
				    		server.emit(socket, 
								"newGameMapResponse", data);
						}
					}
				}
			}
		});
	    } else {
		server.emit(client.socket, 
			"alert", "Could not read from map file.");
	    }
	});
    }
}

/**
* Emits the map data associated with the game session
* to the client requesting it. If there is no map data,
* the data read from "./assets/map" is associated with 
* the game session before emitting.
* @param param - data passed by the router
* @param param.client - the client requesting the information
* @memberof module:server/Session
*/
Session.prototype.getGameMap = function(param) {
    if (debug) {
	log("server/session: getGameMap()");
    }
    var client = param.client;
	if(!client.player) return;
	var id = client.player.id;
    //var data = param.data;
    if(GAME_SESSIONS[id].map === "") GAME_SESSIONS[id].map = "./assets/map";
    	files.readFile(GAME_SESSIONS[id].map, function(data) {
	if(data) {
	    //server.emit(client.socket, "newGameMapResponse", {data:data, path:GAME_SESSION.map});
	    server.emit(client.socket, "newGameMapResponse", data);
	} else {
	    server.emit(client.socket, "alert", "Could not read from map file");
	}
    });
}



module.exports = new Session();
module.exports.GAME_SESSIONS = GAME_SESSIONS;

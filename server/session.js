
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
	if(debug) log("[Session] listen()");
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
	var id = GAME_SESSIONS.length;
	log(id);
	// Create new session with client.player as host
	GAME_SESSIONS[id] = {host:client, map:"", clients:[client]};
	// Move the player into the game lobby
	server.emit(client.socket, "enterLobby", {isHost:true});
	server.emit(client.socket, "updateLobby", getNames(GAME_SESSIONS[id].clients));
	server.emit(client.socket, "alert", "You are host of lobby " + id);
	client.id = id;
}

/**
* Resets the game session object and ejects all players
* to their login screen.
* @param param - the data passed by the router
* @param param.clients - client list
* @memberof module:server/Session
*/
Session.prototype.endGameSession = function(param) {
	var id = param.client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
    // Reset the object
    session.host = null;
    session.map = "";
	// Kick everyone out to the session browser
    for(var i in session.clients) {
		var c = session.clients[i];
		dbi.setUserOnlineStatus(c.username, false);
		if(c.player) {
			c.player = null;
			server.emit(c.socket, "logoutResponse", null);
		} else {
			server.emit(c.socket, "exitLobby", null);
		}
		c.id = -1;
		server.emit(c.socket, "alert", "The game session has ended");
    }
    session.clients = [];
	// Remove the session from the sessions list
	var index = GAME_SESSIONS.indexOf(session);
 	GAME_SESSIONS.splice(index, 1);
}

/**
* Moves every client in the session into a new game
* @param param - data passed by router
* @param param.client - client starting the game
*/
Session.prototype.beginGameSession = function(param) {
	var id = param.client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
	for(var i in session.clients) {
		var c = session.clients[i];
		// Assign a new player to the client
		c.player = new player.Player();
	    // Turn the client online in the database
	    dbi.setUserOnlineStatus(c.username, true);
		server.emit(c.socket, "enterGame", null);
		server.emit(c.socket, "alert", "Game started");
	}
}

/**
* Removes a given client from the game session. Ends
* the game session if the client is host.
* @param param - passed by the router
* @param param.client - client to remove
* @memberof module:server/Session
*/
Session.prototype.exitGameSession = function(param) {
	var client = param.client;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
    // Remove the client from the game session list
    var index = session.clients.indexOf(client);
    if(index > -1) session.clients.splice(index, 1);
    // Turn the client offline in the database
    dbi.setUserOnlineStatus(client.username, false);
	// Send the client out of the lobby
	server.emit(client.socket, "exitLobby", null);
	// Update the lobbies of everyone else
	for(var i in session.clients) {
		var c = session.clients[i];
		server.emit(c.socket, "updateLobby", getNames(session.clients));
	}
	server.emit(client.socket, "alert", "You have left lobby " + id);
    // If client is host, kick everyone out
    if(client === session.host) {
		Session.prototype.endGameSession({client:client});
	}
	client.player = null;
	client.id = -1;
}

/**
* Adds a given client to the game session. Client is
* made host if they are the first to be added.
* @param param - data passed by the router
* @param param.client - client to be added to the session
* @memberof module:server/Session
*/
Session.prototype.enterGameSession = function(param) {
	var client = param.client;
	var id = param.data.id;
	if(id >= GAME_SESSIONS.length) {
		server.emit(client.socket, "alert", "No such game session");
		return;
	}
	var session = GAME_SESSIONS[id];
    // If session is empty, client becomes host
	var isHost = false;
    if(session.clients.length === 0) {
		session.host = client;
		isHost = true;
    }
    // Add client to game session list
   	session.clients.push(client);
	// Move client into the game lobby
	server.emit(client.socket, "enterLobby", {isHost:isHost});
	// Update every lobby list
	for(var i in session.clients) {
		var c = session.clients[i];
		server.emit(c.socket, "updateLobby", getNames(session.clients));
	}
	server.emit(client.socket, "alert", "You have entered lobby " + id);
	client.id = id;
}

Session.prototype.sessionListRequest = function(param) {
	var client = param.client;
	server.emit(client.socket, "sessionListResponse", getSessionTable());
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
	var client = param.client;
    var filename = param.data.filename;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
    if(client !== session.host) {
		server.emit(client.socket, "alert", "Only host can load maps.");
    } else {
	dbi.getMapFilePath(filename, function(path) {
	    if(path) {
		files.readFile(path, function(data) {
		    if(data) {
				// Set the session's map file path
				session.map = path;
				// Emit new map data to session clients
				for(var i in session.clients) {
					var c = session.clients[i];
					server.emit(c.socket, "newGameMapResponse", data);
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
    var client = param.client;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
    if(session.map === "") session.map = "./assets/map";
    files.readFile(session.map, function(data) {
		if(data) {
	    	server.emit(client.socket, "newGameMapResponse", data);
		} else {
	    	server.emit(client.socket, "alert", "Could not read from map file");
		}
    });
}

function getNames(clients) {
	var names = [];
	for(var i in clients) {
		names.push(clients[i].username);
	}
	return names;
}

function getSessionTable() {
	var table = [];
	for(var i in GAME_SESSIONS) {
		var s = GAME_SESSIONS[i];
		table[i] = {host:"", map:"", users:[]};
		table[i].host = s.host ? s.host.username : "";
		table[i].map = s.map;
		for(var j in s.clients) {
			table[i].users.push(s.clients[j].username);
		}
	}
	return table;
}


module.exports = new Session();
module.exports.GAME_SESSIONS = GAME_SESSIONS;


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
    router.listen("deleteGameSession", this.deleteGameSession);
    router.listen("enterGameSession", this.enterGameSession);
	router.listen("exitGameSession", this.exitGameSession);
	router.listen("sessionListRequest", this.sessionListRequest);
	
	router.listen("setHost", this.setHost);
	router.listen("kickUser", this.kickUser);
	
	router.listen("startGame", this.startGame);
	router.listen("stopGame", this.stopGame);
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
	GAME_SESSIONS[id] = {host:client, clients:[client], 
		game:{map:"", players:[], running:false}};
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
Session.prototype.deleteGameSession = function(param) {
	var id = param.client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
    // Null out the object
    session.host = null;
    session.game = null;
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
    session.clients = null;
	// Remove the session from the sessions list
	var index = GAME_SESSIONS.indexOf(session);
 	GAME_SESSIONS.splice(index, 1);
}

/**
* Adds a given client to the game session. Client is
* made host if they are the first to be added.
* @param param - data passed by the router
* @param param.client - client to be added to the session
* @memberof module:server/Session
*/
Session.prototype.enterGameSession = function(param) {
	log("[Session] enterGameSession");
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
	param.client.id = id;
	if(session.game.running) {
		var val = false;
		for(var i in session.game.players) {
			var p = session.game.players[i];
			if(client.username === p.name) {
				client.player = p;
				p.active = val = true;
				server.emit(client.socket, "alert", "Rejoined game");
			    // Turn the client online in the database
			    dbi.setUserOnlineStatus(client.username, true);
				server.emit(client.socket, "enterGame", null);
				break;
			}
		}
		if(!val) {
			client.player = new player.Player(client.username);
			session.game.players.push(client.player);
		    // Turn the client online in the database
		    dbi.setUserOnlineStatus(c.username, true);
			server.emit(c.socket, "enterGame", null);
			server.emit(client.socket, "alert", "Joined game in progress");
		}
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
	log("[Session] exitGameSession");
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
		Session.prototype.deleteGameSession({client:client});
	} else {
		for(var i in session.game.players) {
			if(session.game.players[i] === client.player) {
				session.game.players[i].active = false;
				break;
			}
		}
	}
	client.player = null;
	client.id = -1;
}


// Host power -- forcibly removes a target user from the lobby
Session.prototype.kickUser = function(param) {
	var client = param.client;
	var targetName = param.data;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
	if(targetName === session.host.username) {
		server.emit(client.socket, "alert", 
			"Host cannot be kicked");
		return;
	}
	var target = session.clients.find(function(c) {
		return c.username === targetName;
	});
	if(target) {
		var index = session.clients.indexOf(target);
		// Remove from session list
		session.clients.splice(index, 1);
		// Set offline in database
		dbi.setUserOnlineStatus(targetName, false);
		// Disable in game if needed
		for(var i in session.game.players) {
			if(session.game.players[i] === target.player) {
				session.game.players[i].active = false;
				break;
			}
		}
		// Move target out of the lobby
		server.emit(target.socket, "exitLobby", null);
		server.emit(target.socket, "alert", 
			"You have been kicked from the lobby");
		target.player = null;
		target.id = -1;
		server.emit(client.socket, "alert", 
			targetName + " has been kicked");
		// Modify the lobby lists
		for(var i in session.clients) {
			var c = session.clients[i];
			server.emit(c.socket, "updateLobby", 
				getNames(session.clients));
		}
	} else {
		server.emit(client.socket, "alert", "No such player");
	}
}

// Promotes the target user to host
Session.prototype.setHost = function(param) {
	var client = param.client;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
	if(client.username === param.data) {
		server.emit(client.socket, "alert", "Host cannot be promoted");
		return;
	}
	var target = session.clients.find(function(c) {
		return c.username === param.data;
	});
	if(target) {
		// Set target to host
		session.host = target;
		// Notify target of the changes, refresh lobby
		server.emit(target.socket, "alert", "You are now host of lobby " + id);
		server.emit(target.socket, "exitLobby", null);
		server.emit(target.socket, "enterLobby", {isHost:true});
		// Notify former host of changes, refresh
		server.emit(client.socket, "alert", param.data + " is now host");
		server.emit(client.socket, "exitLobby", null);
		server.emit(client.socket, "enterLobby", {isHost:false});
	} else {
		server.emit(client.socket, "alert", "No such player");
	}
}

// Returns the list of all game sessions to the client
Session.prototype.sessionListRequest = function(param) {
	var client = param.client;
	server.emit(client.socket, "sessionListResponse", getSessionTable());
}

/**
* Moves every client in the session into a game world
* @param param - data passed by router
* @param param.client - client starting the game
*/
Session.prototype.startGame = function(param) {
	var id = param.client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
	session.game = {map:"", players:[], running:false};
	loadMap(param.data.filename, session, function(resp) {
		if(!resp) {
			server.emit(param.client.socket, "alert", 
			"Could not load map data");
		} else {
			for(var i in session.clients) {
				var c = session.clients[i];
				// Assign a new player to the client
				c.player = new player.Player(c.username);
				session.game.players.push(c.player);
			    // Turn the client online in the database
			    dbi.setUserOnlineStatus(c.username, true);
				server.emit(c.socket, "enterGame", null);
				server.emit(c.socket, "alert", "Game started");
			}
			session.game.running = true;
		}
	});
}

Session.prototype.stopGame = function(param) {
	
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
	if(!session.game.running) return;
    files.readFile(session.game.map, function(data) {
		if(data) {
	    	server.emit(client.socket, "newGameMapResponse", data);
		} else {
	    	server.emit(client.socket, "alert", "Could not read from map file");
		}
    });
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
		loadMap(filename, session, function(resp) {
			if(!resp) server.emit(client.socket, 
				"alert", "Could not read from map file.");
		});
	}
}



//====== HELPERS ====================================

function loadMap(filename, session, cb) {
	dbi.getMapFilePath(filename, function(path) {
		if(!path) {
			cb(false);
		} else {
			files.readFile(path, function(data) {
				if(!data) { 
					cb(false);
				} else {
					// Set the session's map file path
					session.game.map = path;
					// Emit new map data to session clients
					for(var i in session.clients) {
						var c = session.clients[i];
						server.emit(c.socket, 
							"newGameMapResponse", data);
					}
					cb(true);
				}
			});
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
		table[i] = {host:"", running:"", users:[]};
		table[i].host = s.host ? s.host.username : "";
		table[i].running = s.game.running ? "yes" : "no";
		for(var j in s.clients) {
			table[i].users.push(s.clients[j].username);
		}
	}
	return table;
}


module.exports = new Session();
module.exports.GAME_SESSIONS = GAME_SESSIONS;

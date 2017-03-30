
var debug = require("./debug.js").session;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");
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
	
	router.listen("inviteUser", this.inviteUser);
	router.listen("setHost", this.setHost);
	router.listen("kickUser", this.kickUser);
	
	router.listen("startGame", this.startGame);
	router.listen("stopGame", this.stopGame);
	router.listen("resumeGame", this.resumeGame);
	router.listen("exitGame", this.exitGame);
	router.listen("enterGame", this.enterGame);
	
    router.listen("getGameMap", this.getGameMap);
	router.listen("loadGameState", this.loadGameState);
	router.listen("saveGameState", this.saveGameState);
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
	GAME_SESSIONS[id] = {
		host:client, 
		clients:[client],
		game:{
			map:"", 
			players:[], 
			projectiles:[],
			wind:null,
			running:false,
		}, 
		mapData:null
	};
	// Move the player into the game lobby
	server.emit(client.socket, "lobbyScreen", {isHost:true});
	server.emit(client.socket, "updateLobby", getNames(GAME_SESSIONS[id].clients));
	server.emit(client.socket, "alert", "You are host of lobby " + id);
	client.id = id;
	pushSessionTable(param.clients);
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
		server.emit(c.socket, "sessionBrowser", null);
		c.player = null;
		c.id = -1;
		server.emit(c.socket, "alert", "The game session has ended");
    }
    session.clients = null;
	// Remove the session from the sessions list
	var index = GAME_SESSIONS.indexOf(session);
 	GAME_SESSIONS.splice(index, 1);
	pushSessionTable(param.clients);
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
	var id = param.data;
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
	server.emit(client.socket, "lobbyScreen", {isHost:isHost});
	// Update every lobby list
	for(var i in session.clients) {
		var c = session.clients[i];
		server.emit(c.socket, "updateLobby", getNames(session.clients));
	}
	server.emit(client.socket, "alert", "You have entered lobby " + id);
	client.id = id;
	pushSessionTable(param.clients);
}

/**
* Removes a given client from the game session. Ends
* the game session if the client is host.
* @param param - passed by the router
* @param param.client - client to remove
* @memberof module:server/Session
*/
Session.prototype.exitGameSession = function(param) {
	if(debug) log("[Session] exitGameSession");
	var client = param.client;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
    // Remove the client from the game session list
    var index = session.clients.indexOf(client);
    if(index > -1) session.clients.splice(index, 1);
	// Send the client out of the lobby
	server.emit(client.socket, "sessionBrowser", null);
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
	pushSessionTable(param.clients);
}

// Host power -- invite a client with the given username
Session.prototype.inviteUser = function(param) {
	var client = param.client;
	var targetName = param.data;
	if(targetName === client.username) {
		server.emit(client.socket, "alert", "Self-invitations not allowed");
	}
	var id = client.id;
	if(id === -1) return;
	var target = param.clients.find(function(c) {
		return c.username === targetName;
	});
	if(!target) {
		server.emit(client.socket, "alert", "No such user");
	} else if(target.id == client.id) {
		server.emit(client.socket, "alert", "User is already in lobby");
	} else {
		server.emit(target.socket, "invitation", 
			{username:client.username, id:id});
	}
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
		// Disable in game if needed
		for(var i in session.game.players) {
			if(session.game.players[i] === target.player) {
				session.game.players[i].active = false;
				break;
			}
		}
		// Move target out of the lobby
		server.emit(target.socket, "sessionBrowser", null);
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
		for(var i in param.clients) {
			var c = param.clients[i];
			server.emit(c.socket, "sessionListResponse", getSessionTable());
		}
		pushSessionTable(param.clients);
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
		if(target.player) {
			server.emit(target.socket, "gameScreen", {isHost:true});
		} else {
			server.emit(target.socket, "lobbyScreen", {isHost:true});
		}
		// Notify former host of changes, refresh
		server.emit(client.socket, "alert", param.data + " is now host");
		if(client.player) {
			server.emit(client.socket, "gameScreen", {isHost:false});
		} else {
			server.emit(client.socket, "lobbyScreen", {isHost:false});
		}
		pushSessionTable(param.clients);
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
	session.game = {
		map:param.data, 
		players:[], 
		projectiles:[], 
		wind:null,
		running:false
	};
	loadMap(param.data, session, function(resp) {
		if(!resp) {
			server.emit(param.client.socket, "alert", 
			"Could not read from map file");
		} else {
			setGame(session, session.game);
		}
	});
	pushSessionTable(param.clients);
}

// Ends the game currently running in this session,
// if one exists, and puts everyone back in the
// lobby
Session.prototype.stopGame = function(param) {
	var client = param.client;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
	if(client !== session.host) {
		server.emit(client.socket, "alert", "Only the host may end the game");
		return;
	}
	if(!session.game.running) return;
	session.game.running = false;
	for(var i in session.clients) {
		var c = session.clients[i];
		c.player = null;
		server.emit(c.socket, "lobbyScreen", 
			{isHost:(c === session.host)});
		server.emit(c.socket, "alert", "The game is over");
	}
	session.game = {
		map:"", 
		players:[], 
		projectiles:[], 
		wind:null,
		running:false
	};
	pushSessionTable(param.clients);
}

Session.prototype.resumeGame = function(param) {
	var client = param.client;
    var filename = param.data;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
    if(client !== session.host) {
		server.emit(client.socket, 
			"alert", "Only host can load saves.");
    } else {
		loadSave(filename, function(data) {
			if(!data) {
				server.emit(client.socket, 
				"alert", "Could not read from save file");
			} else {
				loadMap(data.map, session, function(resp) {
					if(!resp) {
						server.emit(client.socket, 
						"alert", "Could not read from map file.");
					} else {
						setGame(session, data);
					}
				});
			}
		});
		pushSessionTable(param.clients);
	}
}

// Enters the requesting client into the game
Session.prototype.enterGame = function(param) {
	var client = param.client;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
	if(!session.game.running) {
		server.emit(client.socket, "alert", "Game is not currently active");
		return;
	}
	var p = session.game.players.find(function(pl) {
		return pl.name === client.username;
	});
	if(p) {
		client.player = p;
		if(p.alive) {
			p.active = true;
			server.emit(client.socket, "alert", "Rejoining game");
		} else {
			server.emit(client.socket, "alert", "Spectating game");
		}
	} else {
		client.player = new player(client.username, 5, 5);
		server.emit(client.socket, "alert", "Joining as new player");
		session.game.players.push(client.player);
	}
	server.emit(client.socket, "gameScreen", {isHost:false});
	pushSessionTable(param.clients);
}


// Removes the requesting client from the game, returning
// to the lobby
Session.prototype.exitGame = function(param) {
	var client = param.client;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
	if(!session.game.running) return;
	// Stop the game if the host exits
	if(client === session.host) {
		Session.prototype.stopGame({client:client});
	} else {
		// Disable in game
		for(var i in session.game.players) {
			if(session.game.players[i] === client.player) {
				session.game.players[i].active = false;
				break;
			}
		}
		client.player = null;
		// Move back to lobby
		server.emit(client.socket, "lobbyScreen", {isHost:false});
		pushSessionTable(param.clients);
	}
}

/**
* Emits the game map associated with this session
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
	server.emit(client.socket, "newGameMapResponse", session.mapData);
}

Session.prototype.saveGameState = function(param) {
	var client = param.client;
	var filename = param.data;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
	// Write the game state to the database
	dbi.addSavedGame(client.username, filename, session.game, function(resp) {
		if(!resp) {
			server.emit(client.socket, "alert", "Could not save to database");
		} else {
			server.emit(client.socket, "alert", "Saved " + filename);
			// Push the changes to all clients
			dbi.getSavedGamesList(function(data) {
				for(var i in param.clients) {
					server.emit(param.clients[i].socket, 
						"savedGamesListResponse", data);
				}
			});
		}
	});
}


/**
* Loads the game save data from a given filename, associates it 
* with the game session, and emits the map to all clients.
* @param param - data passed by the router
* @param param.client - client attempting the load
* @param param.data - the filename
* @memberof module:server/Session
*/
Session.prototype.loadGameState = function(param) {
	var client = param.client;
    var filename = param.data;
	var id = client.id;
	if(id === -1) return;
	var session = GAME_SESSIONS[id];
    if(client !== session.host) {
		server.emit(client.socket, "alert", "Only host can load saves.");
    } else {
		loadSave(filename, function(data) {
			if(!data) {
				server.emit(client.socket, 
				"alert", "Could not read from save file");
			} else {
				loadMap(data.map, session, function(resp) {
					if(!resp) {
						server.emit(client.socket, 
						"alert", "Could not read from map file.");
					} else {
						setGame(session, data);
					}			
				});
			}
		});
		pushSessionTable(param.clients);
	}
}



//====== HELPERS ====================================

// Reads save from database and returns it
function loadSave(filename, cb) {
	dbi.getSavedGame(filename, function(data) {
		cb(data);
	});
}

// Emits the session's current game map to its clients
function loadMap(map, session, cb) {
	dbi.getSavedMap(map, function(data) {
		if(!data) { 
			cb(false);
		} else {
			session.mapData = data;
			// Emit new map data to session clients
			for(var i in session.clients) {
				var c = session.clients[i];
				server.emit(c.socket, "newGameMapResponse", data);
			}
			cb(true);
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

function pushSessionTable(clients) {
	// Send the changes to all clients
	for(var i in clients) {
		server.emit(clients[i].socket, 
			"sessionListResponse", getSessionTable());
	}
}

function setGame(session, other) {
	var start = !session.game.running;
	// Freeze both games
	session.game.running = false;
	other.running = false;
	for(var i in session.players) {
		session.game.players[i].active = false;
	}
	for(var i in other.players) {
		other.players[i].active = false;
	}
	
	// Set game
	session.game = other;

	// Find all spawns in the new map
	var map = session.mapData;
	var spawns = [];
	for(var i = 0; i < map.data.length; i++) {
		for(var j = 0; j < map.data[i].length; j++) {
			var ch = map.data[i].charAt(j);
			if(ch === "5") { // Spawn
				spawns.push({x:j, y:i});
			}
		}
	}
	
	log(spawns);
	
	// Port all players over
	for(var i in session.clients) {
		var c = session.clients[i];
		// Locate any former player of the client
		var p = session.game.players.find(function(pl) {
			return pl.name === c.username;
		});
		if(p) {
			// If the client is in-game, reassign and activate
			// else just wait for them to rejoin
			if(c.player || start) {
				c.player = p;
				if(c.player.alive) {
					c.player.active = true;
					server.emit(c.socket, "alert", "Resuming play");
				} else {
					server.emit(c.socket, "alert", "Spectating");
				}
			}
		} else {
			// If the client is in-game, assign new active player
			// Else wait for them to join
			if(c.player || start) {
				if(spawns.length > 0) {
					var coords = spawns.pop();
					c.player = new player(c.username, coords.x, coords.y);
					session.game.players.push(c.player);
					server.emit(c.socket, "alert", "Spawning as new player");
				} else {
					server.emit(c.socket, "alert", "Not enough room for you");
				}
			}
		}
		if(start) server.emit(c.socket, 
			"gameScreen", {isHost:(c === session.host)});
	}
	session.game.running = true;
}

module.exports = new Session();
module.exports.GAME_SESSIONS = GAME_SESSIONS;

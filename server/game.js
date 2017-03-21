
var debug = require("./debug.js").game;
var log = require("./debug.js").log;

var server = require("./server.js");

var CLIENT_LIST = require("./router.js").client_list;
var GAME_SESSIONS = require("./session.js").GAME_SESSIONS;
var dbi = require("./dbi.js");


//============== GAME LOGIC =========================================


/**
* The game namespace contains the functions related to the
* game engine--processing input, updating the simulation,
* and emitting the game state.
* @module server/Game
*/
var Game = function() {}

/**
* Registers functions in the namespace with the given
* message router.
* @param router - the message router
* @memberof module:server/Game
*/
Game.prototype.listen = function(router) {
    if(debug) log("[Game] listen()");
    router.listen("keyPress",this.keyPress);
}

/**
* Updates the client's player according to which
* keys the client is pressing.
* @param param - data passed by the router
* @param param.client - the client pressing keys
* @param param.data - the keys being pressed
* @memberof module:server/Game
*/
Game.prototype.keyPress = function (param) {
    if (debug) log("server/game.js: keyPress()");
    var client = param.client;
    var data = param.data;
	// If the client is in control of a player
	if(client.player) {
	    // Assign booleans for each direction
	    if(data.inputId === "left")
		  client.player.pressingLeft = data.state;
	    else if(data.inputId === "right")
		  client.player.pressingRight = data.state;
	    else if(data.inputId === "up")
		  client.player.pressingUp = data.state;
	    else if(data.inputId === "down")
		  client.player.pressingDown = data.state;
	}
}

/**
* The core game loop. Updates the player positions
* and emits them to all clients.
* @memberof module:server/Game
*/
Game.prototype.update = function() {
    // Generate object with all player positions
    for(var i in GAME_SESSIONS) {
		var session = GAME_SESSIONS[i];
		if(session.game.running) {
			var pack = [];
			// Run the physics engine
			for(var j in session.game.players) {
				var p = session.game.players[j];
		   		if(p.active) {
					updatePosition(p);
				}
	    	}
			runCollisions(session);
			// Add the player data to the packet
			for(var j in session.game.players) {
				var p = session.game.players[j];
				if(p.active) {
					pack.push({name:p.name, box:p.box});
				}
				log("\n[" + p.name + "]\n" + 
				"\n\tx: " + p.box.x +
				"\n\ty: " + p.box.y);
			}
			// Send the packet to each client in the game session
		    for(var j in session.clients) {
				var c = session.clients[j];
				if(c.player) {
					server.emit(c.socket, "newPositions", pack);
				}
			}
		}
	}
}

/**
* Updates the "seconds played" and "distance sailed" stats
* for every player currently in a game.
* @memberof module:server/Game
*/
Game.prototype.updateStats = function() {
	// Flag for stats emit
	var send = false;
	for(var i in GAME_SESSIONS) {
		var session = GAME_SESSIONS[i];
		var users = [];
		var stats = [];
		for(var j in session.game.players) {
			var p = session.game.players[j];
			if(p.active) {
				send = true;
				users.push(p);
				var arr = [];
				arr.push({name:"seconds_played", diff:1});
				arr.push({name:"shots_fired", diff:0});
				arr.push({name:"distance_sailed", diff:p.diff});
				arr.push({name:"ships_sunk", diff:0});
				arr.push({name:"ships_lost", diff:0});
				stats.push(arr);
				p.diff = 0;
			}
		}
		if(send) {
			dbi.updateStats(users, stats, function(resp) {
				if(!resp && debug) {
					log("Failed to update stats");
				}
			});
		}
	}
	// If any of the players are in game
	// Push the stats changes to all clients
	if(send) {
	dbi.getAllStats(function(data) {
	    if(data) {
			for(var i in CLIENT_LIST) {
				server.emit(CLIENT_LIST[i].socket, 
					"statsMenuResponse", data);
			}
	    }
	});
	}
}

function updatePosition(player) {
	if(!player.active) return;

	player.box.prev_x = player.box.x;
	player.box.prev_y = player.box.y;

	var dx = 0, dy = 0;
	if(player.pressingRight) dx += player.maxSpeed;
	if(player.pressingLeft) dx -= player.maxSpeed;
	if(player.pressingUp) dy -= player.maxSpeed;
	if(player.pressingDown) dy += player.maxSpeed;

	player.box.x += dx;
	player.box.y += dy;
}

function runCollisions(session) {
	
	for(var i in session.game.players) {
		var box = session.game.players[i].box;
		var map = session.mapData;
		// Check each player's bounding box against the map limits
		if(box.x < 0) box.x = 0;
		if(box.y < 0) box.y = 0;
		if(box.x + box.w > map.width) box.x = map.width - box.w;
		if(box.y + box.h > map.height) box.y = map.height - box.h;
	}
	
	// Calculate the diffs with the corrected boxes
	for(var i in session.game.players) {
		var player = session.game.players[i];
		var dx = player.box.x - player.box.prev_x;
		var dy = player.box.x - player.box.prev_x;
		player.diff += Math.sqrt(dx * dx + dy * dy);
	}
	
}


module.exports = new Game();

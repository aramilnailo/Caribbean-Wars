
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
			for(var j in session.game.players) {
				var p = session.game.players[j];
		   		if(p.active) {
					updatePosition(p);
		    		pack.push({x:p.x, y:p.y, name:p.name});
				}
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
	for(var i in GAME_SESSIONS) {
		var session = GAME_SESSIONS[i];
		for(var j in session.game.players) {
			var p = session.game.players[j];
			if(p.active) {
				// Add time change to seconds played
	    		dbi.updateStat(p.name, "seconds_played", 1, function(resp) {
					if(!resp && debug) log("Failed to update seconds played");
	    		});
				// Add position change to distance sailed
				dbi.updateStat(p.name, "distance_sailed", p.diff, function(resp) {
					if(resp) {
						// Reset the position change
						p.diff = 0;
					} else {
						if(debug) log("[Game] Could not update stats");
					}
				});
			}
		}
	}
}

function updatePosition(player) {
	if(!player.active) return;
	var oldX = player.x, oldY = player.y;
	if(player.pressingRight) player.x += player.maxSpeed;
	if(player.pressingLeft) player.x -= player.maxSpeed;
	if(player.pressingUp) player.y -= player.maxSpeed;
	if(player.pressingDown) player.y += player.maxSpeed;
	var diffX = player.x - oldX, diffY = player.y - oldY;
	player.diff += Math.sqrt(diffX * diffX + diffY * diffY);
}


module.exports = new Game();

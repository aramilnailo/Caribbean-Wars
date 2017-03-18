
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
var Game = function() {};

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
	if(client.player !== null) {
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
		var pack = [];
		for(var j in GAME_SESSIONS[i].clients) {
			var c = GAME_SESSIONS[i].clients[j];
	   		if(c.player) {
				c.player.updatePosition();
	    		pack.push({x:c.player.x, y:c.player.y});
			}
    	}
		// Send the packet to each client in the game session
	    for(var j in GAME_SESSIONS[i].clients) {
			var c = GAME_SESSIONS[i].clients[j];
			if(c.player) {
				server.emit(c.socket, "newPositions", pack);
			} else if(c.usertype === "editor") {
				server.emit(c.socket, "refreshEditScreen");
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
		for(var j in GAME_SESSIONS[i].clients) {
			var c = GAME_SESSIONS[i].clients[j];
			if(c.player) {
				// Add time change to seconds played
	    		dbi.updateStat(c.username, "seconds_played", 1, function(resp) {
					if(!resp && debug) log("Failed to update seconds played");
	    		});
				// Add position change to distance sailed
				dbi.updateStat(c.username, "distance_sailed", c.player.diff, function(resp) {
					if(resp) {
						// Reset the position change
						c.player.diff = 0;
					} else {
						if(debug) log("[Game] Could not update stats");
					}
				});
			}
		}
	}
}

module.exports = new Game();

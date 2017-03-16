
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
    if (debug) log("server/game.js: listen()");
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
		for(var j in GAME_SESSIONS[i].players) {
			var p = GAME_SESSIONS[i].players[j];
			if(p !== null) {
	   		 	p.updatePosition();
	    		pack.push({x:p.x, y:p.y});
			}
    	}
		// Send the packet to each client in the game session
	    for(var j in GAME_SESSIONS[i].players) {
			var p = GAME_SESSIONS[i].players[j];
			for(var k in CLIENT_LIST) {
				var player = CLIENT_LIST[k].player;
				var socket = CLIENT_LIST[k].socket;
				if(p === player) {
					server.emit(socket, "newPositions", pack);
				} else if(player && player.usertype === "editor") {
					server.emit(socket, "refreshEditScreen");
				}
			}
		}
	}
}

/**
* Updates the "seconds played" stat for every player
* currently in the game.
* @memberof module:server/Game
*/
Game.prototype.updateStats = function() {
    //if (debug) log("server/game.js: updateStats()");
	for(var i in GAME_SESSIONS) {
		for(var j in GAME_SESSIONS[i].players) {
			var p = GAME_SESSIONS[i].players[j];
	    	dbi.updateStat(p.username, "seconds_played", 1, function(resp) {
				if(!resp && debug) log("Failed to update seconds played");
	    	});
		}
	}
}

module.exports = new Game();

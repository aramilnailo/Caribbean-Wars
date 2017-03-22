
var debug = require("./debug.js").game;
var log = require("./debug.js").log;

var server = require("./server.js");

var CLIENT_LIST = require("./router.js").client_list;
var GAME_SESSIONS = require("./session.js").GAME_SESSIONS;
var dbi = require("./dbi.js");

var projectile = require("./projectile.js");

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
    router.listen("gameInput",this.input);
}

/**
* Updates the client's player according to which
* keys the client is pressing.
* @param param - data passed by the router
* @param param.client - the client pressing keys
* @param param.data - the keys being pressed
* @memberof module:server/Game
*/
Game.prototype.input = function (param) {
    if (debug) log("server/game.js: input()");
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
		else if(data.inputId === "firing")
			client.player.firing = data.state;
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
		log(session.game.projectiles);
		if(session.game.running) {
			var pack = {ships:[], projectiles:[]};
			// Run the physics engine
			updatePhysics(session);
			// Add the player data to the packet
			for(var j in session.game.players) {
				var p = session.game.players[j];
				if(p.active) {
					pack.ships.push({name:p.name, box:p.box});
				}
			}
			// Add projectile data to the packet
			for(var j in session.game.projectiles) {
				var p = session.game.projectiles[j];
				if(p.active) {
					pack.projectiles.push({box:p.box});
				}
			}
			// Send the packet to each client in the game session
		    for(var j in session.clients) {
				var c = session.clients[j];
				if(c.player) {
					server.emit(c.socket, "gameUpdate", pack);
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
				arr.push({
					name:"shots_fired", 
					diff:p.diff.shotsFired
				});
				arr.push({
					name:"distance_sailed", 
					diff:p.diff.distanceSailed
				});
				arr.push({name:"ships_sunk", diff:0});
				arr.push({name:"ships_lost", diff:0});
				stats.push(arr);
				p.diff.distanceSailed = 0;
				p.diff.shotsFired = 0;
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

function loadProjectile(player) {
	if(player.firing) return;
	if(player.projectiles.length < player.numCannons) {
		player.projectiles.push(new projectile());
	}
}

// Fire all projectiles the player has
function fireProjectile(player, list) {
	if(!player.firing) return;
	var proj = player.projectiles.pop();
	if(!proj) {
		firing = false;
		return;
	}
	proj.box.x = player.box.x;
	proj.box.y = player.box.y;
	proj.active = true;
	list.push(proj);
	player.diff.shotsFired++;
}

function updatePhysics(session) {
	
	var map = session.mapData;
	
	// Move players / handle input
	
	for(var i in session.game.players) {
		var player = session.game.players[i];
		if(!player.active) return;
		
		var box = player.box;
		
		// Correct position at map limits
		if(box.x < 0) box.x = 0;
		if(box.y < 0) box.y = 0;
		if(box.x + box.w > map.width) box.x = map.width - box.w;
		if(box.y + box.h > map.height) box.y = map.height - box.h;
		
		// Store for stats tracking
		player.prevX = box.x;
		player.prevY = box.y;
		
		// Store collisions at corners
		var corners = [{x:box.x, y:box.y},
			{x:box.x + box.w, y:box.y},
			{x:box.x, y:box.y + box.h},
			{x:box.x + box.w, y:box.y + box.h}
		];
				
		// Check corners against map data
		for(var i in corners) {
			var cell_x = Math.floor(corners[i].x);
			var cell_y = Math.floor(corners[i].y);
			if(!map.data[cell_y]) {
				corners[i].bad = true;
			} else {
				var ch = map.data[cell_y].charAt(cell_x);
				corners[i].bad = (ch !== "0");
			}
		}
		
		var hit = false;
		var stuck = false;
		
		// If collisions on all corners, player is stopped
		if(corners[0].bad && corners[1].bad &&
			corners[2].bad && corners[3].bad) {
			player.speedX = 0;
			player.speedY = 0;
			hit = true;
			stuck = true;
		} else {
			// Calculate motion from collisions
			var ddx = ddy = 0.1;
			if(corners[0].bad) {
				player.speedX += ddx;
				player.speedY += ddy;
				if(player.speedX > 0) player.speedX = 0;
				if(player.speedY > 0) player.speedY = 0;
				hit = true;
			}
			if(corners[1].bad) {
				player.speedX -= ddx;
				player.speedY += ddy;
				if(player.speedX < 0) player.speedX = 0;
				if(player.speedY > 0) player.speedY = 0;
				hit = true;
			}
			if(corners[2].bad) {
				player.speedX += ddx;
				player.speedY -= ddy;
				if(player.speedX > 0) player.speedX = 0;
				if(player.speedY < 0) player.speedY = 0;
				hit = true;
			}
			if(corners[3].bad) {
				player.speedX -= ddx;
				player.speedY -= ddy;
				if(player.speedX < 0) player.speedX = 0;
				if(player.speedY < 0) player.speedY = 0;
				hit = true;
			}
		}	
		
		// Handle motion from input
		var ddx = 0, ddy = 0;
		if(player.pressingRight) ddx = stuck ? 0.001 : hit ? 0.01 : player.maxAccel;
		if(player.pressingLeft) ddx = stuck ? -0.001 : hit ? -0.01 : -player.maxAccel;
		if(player.pressingUp) ddy = stuck ? -0.001 : hit ? -0.01 : -player.maxAccel;
		if(player.pressingDown) ddy = stuck ? 0.001 : hit ? 0.01 : player.maxAccel;
		player.speedX += ddx;
		player.speedY += ddy;
	
		// Correct speed bounds
		if(player.speedX > player.maxSpeed) {
			player.speedX = player.maxSpeed;
		} else if(player.speedX < -player.maxSpeed) {
			player.speedX = -player.maxSpeed;
		}
		if(player.speedY > player.maxSpeed) {
			player.speedY = player.maxSpeed;
		} else if(player.speedY < -player.maxSpeed) {
			player.speedY = -player.maxSpeed;
		}
		
		// Apply position changes
		player.box.x += player.speedX;
		player.box.y += player.speedY;
		
		// Handle projectiles
		if(player.firing) {
			fireProjectile(player, 
				session.game.projectiles);
		} else {
			loadProjectile(player);
		}
		
		// Log to debug
		if(debug) {
			var vals = [];
			for(var i in corners) {
				vals[i] = corners[i].bad ? "X" : " ";
			}
			var out = "\n[" + player.name + "]\n" +
			vals[0] + "-------" + vals[1] + "\n" +
			"|       |\n" +
			"|       |\n" +
			"|       |\n" + 
			vals[2] + "-------" + vals[3] + "\n";

			log(out);
		}	
	}
	
	// Move projectiles
	for(var i in session.game.projectiles) {
		var proj = session.game.projectiles[i];
		proj.box.x += proj.dx;
		proj.box.y += proj.dy;
		if(proj.box.x < 0 || proj.box.x > map.width ||
		proj.box.y < 0 || proj.box.y > map.height) {
			proj.active = false;
		}
	}
	
	// Calculate the diffs with the corrected boxes
	for(var i in session.game.players) {
		var player = session.game.players[i];
		var dx = player.box.x - player.prevX;
		var dy = player.box.x - player.prevY;
		player.diff.distanceSailed += Math.sqrt(dx * dx + dy * dy);
	}
	
}

module.exports = new Game();

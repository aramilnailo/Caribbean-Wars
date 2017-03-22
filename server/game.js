
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
		  	client.player.input.left = data.state;
	    else if(data.inputId === "right")
		  	client.player.input.right = data.state;
	    else if(data.inputId === "up")
		  	client.player.input.up = data.state;
	    else if(data.inputId === "down")
		  	client.player.input.down = data.state;
		else if(data.inputId === "firing")
			client.player.input.firing = data.state;
		else if(data.inputId === "rotating")
			client.player.input.rotating = data.state;
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

// Physics engine
function updatePhysics(session) {
	var map = session.mapData;
	// Move players / handle player collisions / handle input
	for(var i in session.game.players) {
		var player = session.game.players[i];
		if(!player.active) continue;
		var box = player.box;
		// Store for stats tracking
		player.prevX = box.x;
		player.prevY = box.y;
		// Correct position at map limits
		if(box.x < 0) box.x = 0;
		if(box.y < 0) box.y = 0;
		if(box.x + box.w > map.width) box.x = map.width - box.w;
		if(box.y + box.h > map.height) box.y = map.height - box.h;
		// Correct speed bounds
		if(box.dx > player.maxSpeed) {
			box.dx = player.maxSpeed;
		} else if(box.dx < -player.maxSpeed) {
			box.dx = -player.maxSpeed;
		}
		if(box.dy > player.maxSpeed) {
			box.dy = player.maxSpeed;
		} else if(box.dy < -player.maxSpeed) {
			box.dy = -player.maxSpeed;
		}
		// Handle player collisions
		handleCollisions(player.box, map);
		// Handle input
		handleInput(player, session.game.projectiles);
	}
	// Calculate the diffs with the corrected boxes
	for(var i in session.game.players) {
		if(!player.active) continue;
		var player = session.game.players[i];
		var dx = player.box.x - player.prevX;
		var dy = player.box.y - player.prevY;
		player.diff.distanceSailed += 
			Math.sqrt(dx * dx + dy * dy);
	}
	// Move projectiles / handle projectile collisions
	for(var i in session.game.projectiles) {
		var proj = session.game.projectiles[i];
		if(!proj.active) continue;
		// Remove if proj has travelled its range
		var dx = proj.box.dx, dy = proj.box.dy;
		proj.range -= Math.sqrt(dx * dx + dy * dy);
		if(proj.range < 0) proj.active = false;
		// Remove if proj is out of map bounds
		if(proj.box.x < 0 || proj.box.x > map.width ||
			proj.box.y < 0 || proj.box.y > map.height)
				proj.active = false;
		if(proj.active) {
			// Handle projectile collision
			handleCollisions(proj.box, map);
			// Update position
			proj.box.x += proj.box.dx;
			proj.box.y += proj.box.dy;
		}
	}
}

function handleCollisions(box, map) {
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
	// If collisions on all corners, box is stopped
	if(corners[0].bad && corners[1].bad &&
		corners[2].bad && corners[3].bad) {
		box.dx = 0;
		box.dy = 0;
		hit = true;
		stuck = true;
	} else {
		// Handle motion from collisions
		var ddx = ddy = 0.1;
		if(corners[0].bad) {
			box.dx += ddx;
			box.dy += ddy;
			if(box.dx > 0) box.dx = 0;
			if(box.dy > 0) box.dy = 0;
			hit = true;
		}
		if(corners[1].bad) {
			box.dx -= ddx;
			box.dy += ddy;
			if(box.dx < 0) box.dx = 0;
			if(box.dy > 0) box.dy = 0;
			hit = true;
		}
		if(corners[2].bad) {
			box.dx += ddx;
			box.dy -= ddy;
			if(box.dx > 0) box.dx = 0;
			if(box.dy < 0) box.dy = 0;
			hit = true;
		}
		if(corners[3].bad) {
			box.dx -= ddx;
			box.dy -= ddy;
			if(box.dx < 0) box.dx = 0;
			if(box.dy < 0) box.dy = 0;
			hit = true;
		}
	}
	box.hit = hit;
	box.stuck = stuck;
	// Log to debug
	if(false) {
		var vals = [];
		for(var i in corners) {
			vals[i] = corners[i].bad ? "X" : " ";
		}
		var out = "\n[" + box.x + ", " + box.y + "]\n" +
		vals[0] + "-------" + vals[1] + "\n" +
		"|       |\n" +
		"|       |\n" +
		"|       |\n" + 
		vals[2] + "-------" + vals[3] + "\n";
		log(out);
	}
}

function handleInput(player, list) {
	var stuck = player.box.stuck;
	var hit = player.box.hit;
	// Handle motion from input
	var ddx = 0, ddy = 0;
	if(player.input.right) ddx = stuck ? 0.001 : hit ? 0.01 : player.maxAccel;
	if(player.input.left) ddx = stuck ? -0.001 : hit ? -0.01 : -player.maxAccel;
	if(player.input.up) ddy = stuck ? -0.001 : hit ? -0.01 : -player.maxAccel;
	if(player.input.down) ddy = stuck ? 0.001 : hit ? 0.01 : player.maxAccel;
	// Apply velocity changes
	player.box.dx += ddx;
	player.box.dy += ddy;
	// Apply position changes
	player.box.x += player.box.dx;
	player.box.y += player.box.dy;
	// Apply rotation
	if(player.input.rotating) {
		player.box.dir += 0.1;
	}
	// Fire / load projectiles
	if(player.input.firing) {
		fireProjectile(player, list);
	} else {
		loadProjectile(player);
	}
}

// Fire all projectiles the player has
function fireProjectile(player, list) {
	if(!player.input.firing) return;
	var proj = player.projectiles.pop();
	if(!proj) {
		player.input.firing = false;
		return;
	}
	proj.box.x = player.box.x;
	proj.box.y = player.box.y;
	// Fire from the side
	proj.box.dir = player.box.dir + 
		(3 * Math.PI / 2);
	proj.box.dx = Math.cos(proj.box.dir);
	proj.box.dy = Math.sin(proj.box.dir);
	proj.active = true;
	list.push(proj);
	player.diff.shotsFired++;
}

function loadProjectile(player) {
	if(player.input.firing) return;
	if(player.projectiles.length < player.numCannons) {
		var proj = new projectile();
		player.projectiles.push(proj);
	}
}



module.exports = new Game();

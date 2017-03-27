
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

var losers = [];

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
					pack.ships.push({name:p.name, box:p.box, 
						health:p.health, ammo:p.projectiles.length});
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
	while(losers.length > 0) {
		var l = losers.pop();
		client = CLIENT_LIST.find(function(c) {
			return c.player === l.player;
		});
		if(client) {
			server.emit(client.socket, "alert", "You have been defeated by " + l.killer);
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
				arr.push({
					name:"ships_lost", 
					diff:p.diff.shipsLost
				});
				stats.push(arr);
				p.diff.distanceSailed = 0;
				p.diff.shotsFired = 0;
				p.diff.shipsLost = 0;
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

Game.prototype.updateOnlineStatus = function() {
	dbi.getAllUserInfo(function(data) {
		if(data) {
			for(var i in data) {
				var client = CLIENT_LIST.find(function(c) {
					return c.username === data[i].username;
				});
				if(client) {
					dbi.setUserOnlineStatus(data[i].username, true, function(resp) {});
					if(client.player) {
						dbi.setUserInGameStatus(data[i].username, true, function(resp) {});
					} else {
						dbi.setUserInGameStatus(data[i].username, false, function(resp) {});
					}
				} else {
					dbi.setUserOnlineStatus(data[i].username, false, function(resp) {});
					dbi.setUserInGameStatus(data[i].username, false, function(resp) {});
				}
			}
			for(var i in CLIENT_LIST) {
				server.emit(CLIENT_LIST[i].socket, "userListResponse", data);
			}
		}
	});
} 

// Physics engine
function updatePhysics(session) {
	var map = session.mapData;
	// Move players / handle player collisions / handle input
	for(var i in session.game.players) {
		var player = session.game.players[i];
		if(!player.active) continue;
		// Store x and y for stats tracking
		player.prevX = player.box.x;
		player.prevY = player.box.y;
		// Handle input
		handleInput(player, session.game.projectiles);
		// Handle player collisions
		handleCollisions(player.box, session);
		// Update player boxes
		var dmg = updateBox(player.box, map);
		player.health -= dmg.mag;
		if(player.health < 0) {
			player.health = 0;
			player.alive = false;
			player.active = false;
			losers.push({
				player:player, 
				killer:dmg.source
			});
		}
	}
	// Calculate the diffs with the corrected boxes
	for(var i in session.game.players) {
		var player = session.game.players[i];
		if(!player.active) continue;
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
		// Remove if proj is stopped completely
		if(proj.box.stuck) proj.active = false;
		// Remove if proj is out of map bounds
		if(proj.box.x < 0 || proj.box.x > map.width ||
			proj.box.y < 0 || proj.box.y > map.height)
				proj.active = false;
		if(proj.active) {
			// Handle projectile collision
			handleCollisions(proj.box, session);
			// Update projectile boxes
			updateBox(proj.box, map);
		}
	}
}

// Checks each vert in the box for collisions, returns
// the net force applied to the box
function handleCollisions(box, session) {
	var map = session.mapData;
	// Check verts against map data
	var v = box.verts;
	for(var i in v) {
		// Force vector of any collision on this vert
		var vect = {
			x:box.x - v[i].x,
			y:box.y - v[i].y
		};
		var cell_x = Math.floor(v[i].x);
		var cell_y = Math.floor(v[i].y);
		if(!map.data[cell_y]) {
			v[i].hit = true;
		} else {
			var ch = map.data[cell_y].charAt(cell_x);
			v[i].hit = (ch !== "0");
		}
		if(v[i].hit) {
			box.forces.push(vect);
			box.damage.push({
				mag:1, 
				source:"the map"
			});
		}
	}
	// Check verts against other boxes
	for(var i in v) {
		var vect = {
			x:box.x - v[i].x,
			y:box.y - v[i].y
		};
		var opp_vect = {
			x:v[i].x - box.x,
			y:v[i].y - box.y
		};
		for(var j in session.game.players) {
			var p = session.game.players[j];
			if(!p.active || 
				p.name === box.name ||
				p.box === box) continue;
			if((Math.abs(v[i].x - p.box.x) < p.box.w) &&
				(Math.abs(v[i].y - p.box.y) < p.box.h)) {
					v[i].hit = true;
					box.forces.push(vect);
					p.box.forces.push(opp_vect);
					p.box.damage.push({
						mag:5,
						source:box.name
					});
			}
		}
	}
	// Calculate force from collisions, update stuck / hit
	box.stuck = true;
	box.hit = false;
	for(var i in v) {
		if(!v[i].hit) {
			box.stuck = false;
		} else {
			if(!box.hit) {
				box.hit = true;
			}
		}
	}
	// Log to debug
	if(false) {
		var out = "";
		for(var i in v) {
			var val = v[i].hit ? "X" : "o";
			out += "-" + val;
		}
		log("[" + box.x + ", " + box.y + "]" + out);
	}
}

function updateBox(box) {
	// Calculate damage
	var dmg = {mag:0, source:""};
	while(box.damage.length > 0) {
		var d = box.damage.pop();
		dmg.mag += d.mag;
		dmg.source = d.source;
	}
	
	// Calculate acceleration based on forces
	while(box.forces.length > 0) {
		var force = box.forces.pop();
		box.ddx += force.x / box.mass;
		box.ddy += force.y / box.mass;
	}

	// Apply acceleration to velocity
	box.dx += box.ddx;
	box.dy += box.ddy;
	
	box.ddx = 0;
	box.ddy = 0;

	// Apply velocity bounds
	if(box.dx > box.dx_max) 
		box.dx = box.dx_max;
	else if(box.dx < -box.dx_max) 
		box.dx = -box.dx_max;
	if(box.dy > box.dy_max) 
		box.dy = box.dy_max;
	else if(box.dy < -box.dy_max)
		box.dy = -box.dy_max;
	// Apply velocity to position
	if(box.hit) {
		box.dx *= 0.1;
		box.dy *= 0.1;
	}
	if(box.stuck) {
		box.dx = 0;
		box.dy = 0;
	}
	box.x += box.dx;
	box.y += box.dy;
	// Update verts
	var verts = box.verts;
	// Apply position shift
	for(var i in verts) {
		verts[i].x += box.dx;
		verts[i].y += box.dy;
	}
	// Apply rotation
	for(var i in verts) {
		verts[i].x -= box.x;
		verts[i].y -= box.y;
		var sin = Math.sin(box.ddir);
		var cos = Math.cos(box.ddir);
		var x_new = verts[i].x * cos - verts[i].y * sin;
		var y_new = verts[i].x * sin + verts[i].y * cos;
		verts[i].x = x_new + box.x;
		verts[i].y = y_new + box.y;
	}
	box.ddir = 0;
	
	return dmg;
}

function handleInput(player, list) {
	var mag = 0.01;
	// Apply force
	if(player.input.up) 
		player.box.forces.push({x:0 , y:-mag});
	if(player.input.down)
		player.box.forces.push({x:0 , y:mag});
	if(player.input.left)
		player.box.forces.push({x:-mag , y:0});
	if(player.input.right)
		player.box.forces.push({x:mag , y:0});
	// Rotate
	if(player.input.rotating) {
		player.box.dir += 0.1;
		player.box.ddir = 0.1;
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
	proj = new projectile(player);
	proj.box.forces.push({
		x:player.firepower * Math.cos(proj.box.dir),
		y:player.firepower * Math.sin(proj.box.dir)
	});
	proj.box.ddir = proj.box.dir;
	list.push(proj);
	player.diff.shotsFired++;
}

function loadProjectile(player) {
	if(player.input.firing) return;
	if(player.projectiles.length < player.numCannons) {
		if(player.reloadCount > 1) {
			player.projectiles.push({});
			player.reloadCount = 0;
		} else {
	   		player.reloadCount += player.reloadRate;
	   	}
	}
}



module.exports = new Game();

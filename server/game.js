
var debug = require("./debug.js").game;
var log = require("./debug.js").log;

var server = require("./server.js");

var CLIENT_LIST = require("./router.js").client_list;
var GAME_SESSIONS = require("./session.js").GAME_SESSIONS;
var dbi = require("./dbi.js");

var projectile = require("./projectile.js");
var resource = require("./resource.js");

//============== GAME LOGIC =========================================


/**
* The game namespace contains the functions related to the
* game engine--processing input, updating the simulation,
* and emitting the game state.
* @module server/Game
*/
var Game = function() {}

var losers = [];
var transfers = [];
var docks = [];
var undocks = [];

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
	// If the client is in control of a player
	if(client.player) {
	    // Assign input data
		client.player.input = param.data;
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
			var pack = {
				ships:[], 
				projectiles:[], 
				resources:[],
				wind:session.game.wind
			};
			// Run the physics engine
			updatePhysics(session);
			// Spawn new entities
			updateSpawners(session);
			// Add the player data to the packet
			for(var j in session.game.players) {
				var p = session.game.players[j];
				if(p.active) {
					pack.ships.push({
						name:p.name, 
						box:p.box, 
						health:p.health, 
						ammo:{
							loaded:p.projectiles.length,
							unloaded:p.currentAmmo
						}
					});
				}
			}
			// Add projectile data to the packet
			for(var j in session.game.projectiles) {
				var p = session.game.projectiles[j];
				if(p.active) {
					pack.projectiles.push({box:p.box});
				}
			}
			// Add resource data to the packet
			for(var j in session.game.resources) {
				var r = session.game.resources[j];
				if(r.active) {
					pack.resources.push({box:r.box});
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
	// Handle death events
	while(losers.length > 0) {
		var l = losers.pop();
		var killer = CLIENT_LIST.find(function(c) {
			return c.username === l.killer;
		});
		var client = CLIENT_LIST.find(function(c) {
			return c.player === l.player;
		});
		if(client) {
			server.emit(client.socket, "alert", "Your ship has been destroyed by " + l.killer);
			client.player.diff.shipsLost = 1;
		}
		if(killer && killer.player) {
			server.emit(killer.socket, "alert", "You have destroyed " + l.player.name);
			killer.player.diff.shipsSunk = 1;
		}
	}
	// Handle resource pickup events
	while(transfers.length > 0) {
		var t = transfers.pop();
		var recip = CLIENT_LIST.find(function(c) {
			return c.username === t.recipient;
		});
		if(recip && recip.player) {
			while(t.items.length > 0) {
				var item = t.items.pop();
				if(item.name === "ammo") {
					recip.player.currentAmmo += item.amount;
					server.emit(recip.socket, "alert", 
					"+ " + item.amount + " ammo");
				}
				// Add more resource types here
			}
		}
	}
	// Handle docking events
	while(docks.length > 0) {
		var d = docks.pop();
		var client = CLIENT_LIST.find(function(c) {
			return c.username === d.ship;
		});
		if(client && client.player && client.player.active && 
			!client.player.docked && client.player.input.anchor) {
			server.emit(client.socket, "alert", "You are now docked at a port");
			// TO DO: more complex docking response
			client.player.docked = true;
		}
	}
	// Handle undocking events
	while(undocks.length > 0) {
		var d = undocks.pop();
		var client = CLIENT_LIST.find(function(c) {
			return c.player === d;
		});
		if(client) {
			server.emit(client.socket, "alert", "You have undocked from a port");
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
				arr.push({
					name:"seconds_played", 
					diff:1});
				arr.push({
					name:"shots_fired", 
					diff:p.diff.shotsFired
				});
				arr.push({
					name:"distance_sailed", 
					diff:p.diff.distanceSailed
				});
				arr.push({
					name:"ships_sunk", 
					diff:p.diff.shipsSunk
				});
				arr.push({
					name:"ships_lost", 
					diff:p.diff.shipsLost
				});
				stats.push(arr);
				p.diff.distanceSailed = 0;
				p.diff.shotsFired = 0;
				p.diff.shipsLost = 0;
				p.diff.shipsSunk = 0;
				if(!p.alive) p.active = false;
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
	// Update wind
	if(!session.game.wind) {
		session.game.wind = {x:1, y:1};
	}
	changeWind(session.game.wind);
	var map = session.mapData;
	// Move players / handle player collisions / handle input
	for(var i in session.game.players) {
		var player = session.game.players[i];
		if(!player.active || !player.alive) continue;
		// Store x and y for stats tracking
		player.prevX = player.box.x;
		player.prevY = player.box.y;
		// Handle input
		handleInput(player, session);
		// Handle player collisions
		handleCollisions(player.box, session);
		// Update player boxes
		var dmg = updateBox(player.box, map);
		player.health -= dmg.mag;
		if(player.health < 0) {
			player.health = 0;
			player.alive = false;
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
		var dist = Math.sqrt(dx * dx + dy * dy);
		player.diff.distanceSailed += dist;
			
	}
	// Move projectiles / handle projectile collisions
	for(var i in session.game.projectiles) {
		var proj = session.game.projectiles[i];
		if(!proj.active) continue;
		// Remove if proj has travelled its range
		proj.range -= Math.sqrt(
			proj.box.dx * proj.box.dx + 
			proj.box.dy * proj.box.dy
		);
		if(proj.range < 0) proj.active = false;
		// Remove if proj is stopped completely
		if(proj.box.stuck) proj.active = false;
		if(proj.active) {
			// Handle projectile collision
			handleCollisions(proj.box, session);
			// Update projectile boxes
			updateBox(proj.box, map);
		}
	}
	// Move resources / handle resource collisions
	for(var i in session.game.resources) {
		var res = session.game.resources[i];
		if(!res.active) continue;
		handleCollisions(res.box, session);
		var dmg = updateBox(res.box, map);
		res.health -= dmg.mag;
		if(res.health < 0) {
			res.health = 0;
			res.active = false;
			transfers.push({
				items:res.contents, 
				recipient:dmg.source
			});
		}
	}
}

// Loop through the resource spawners
function updateSpawners(session) {
	for(var i in session.game.resourceSpawns) {
		var r = session.game.resourceSpawns[i];
		r.counter++;
		if(r.counter > 1000) {
			r.counter = 0;
			if(!r.blocked) {
				var res = new resource(r.x, r.y);
				res.contents.push({
					name:"ammo", 
					amount:10
				});
				session.game.resources.push(res);
			}
		}
		r.blocked = false; // Reset for collision detect
	}
	for(var i in session.game.shipSpawns) {
		var s = session.game.shipSpawns[i];
		s.blocked = true;
		// To do -- implement random enemy ship spawns
	}
}

function changeWind(wind) {
	if(Math.random() > 0.99) {
		// 1/100 chance of changing direction
		wind = {
			x:Math.random() - Math.random(),
			y:Math.random() - Math.random()
		};
	} else {
		// Mild fluctuations
		if(Math.random() > 0.5) {
			wind.x += 0.01;
		} else {
			wind.x -= 0.01;
		}
		if(Math.random() > 0.5) {
			wind.y += 0.01;
		} else {
			wind.y -= 0.01;
		}
	}
}

// Checks each vert in the box for collisions, returns
// the net force applied to the box
function handleCollisions(box, session) {
	var map = session.mapData;
	// Check verts against map data
	var v = box.verts;
	var v_mag = Math.sqrt(box.dx * box.dx + box.dy * box.dy);
	// Track whether this box has hit a docking area
	var dock;
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
			// Cannot collide with water or spawners
			v[i].hit = (!ch || ch === "1" || ch === "2" || ch === "3");
			if(!v[i].hit) {
				if(ch === "4") {
					var spawn = session.game.resourceSpawns.find(function(s) {
						return s.x === cell_x && s.y === cell_y;
					});
					if(spawn) spawn.blocked = true;
				} else if(ch === "5") {
					var spawn = session.game.shipSpawns.find(function(s) {
						return s.x === cell_x && s.y === cell_y;
					});
					if(spawn) spawn.blocked = true;
				} else if(ch === "6") {
					// Save the dock coords
					dock = {x:cell_x, y:cell_y};
				}
			}
		}
		if(v[i].hit) {
			box.collisions.push({
				vector:vect,
				mass:box.mass,
				source:"the map", 
				damage:box.mass * v_mag
			});
		}
	}
	// If the box is in contact with a docking area,
	// handle the event
	if(dock) {
		docks.push({
			ship:box.name, 
			coords:dock
		});
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
				// Impulse of p.box on box
				box.collisions.push({
					vector:vect,
					mass:p.box.mass,
					source:p.box.name,
					damage:0
				});
				// Impulse of box on p.box
				p.box.collisions.push({
					vector:opp_vect,
					mass:box.mass * 0.05,
					source:box.name,
					damage:box.mass * v_mag
				});
			}
		}
		for(var j in session.game.resources) {
			var r = session.game.resources[j];
			if(!r.active || r.box === box) continue;
			if((Math.abs(v[i].x - r.box.x) < r.box.w) &&
				(Math.abs(v[i].y - r.box.y) < r.box.h)) {
				v[i].hit = true;
				// Impulse of r.box on box
				box.collisions.push({
					vector:vect,
					mass:r.box.mass,
					source:r.box.name,
					damage:0
				});
				// Impulse of box on r.box
				r.box.collisions.push({
					vector:opp_vect,
					mass:box.mass * 0.05,
					source:box.name,
					damage:box.mass * v_mag
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
	// For each collision
	var dmg = {mag:0, source:""};
	while(box.collisions.length > 0){
		var c = box.collisions.pop();
		// Apply damage
		if(c.damage > 0) {
			dmg.mag += c.damage;
			dmg.source = c.source;
		}
		// Apply impulse
		box.dx += c.vector.x * c.mass / box.mass;
		box.dy += c.vector.y * c.mass / box.mass;
	}

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

function handleInput(player, session) {
	var list = session.game.projectiles;
	var wind = session.game.wind;
	var ship = {
		x:Math.cos(player.box.dir),
		y:Math.sin(player.box.dir)
	};
	var vect;
	var dot;
	
	// Rotate
	if(player.input.right) {
		player.box.dir += 0.03;
		player.box.ddir = 0.03;
	}
	if(player.input.left) {
		player.box.dir -= 0.03;
		player.box.ddir = -0.03;
	}
	
	// Fire / load projectiles
	if(player.input.firingLeft || player.input.firingRight) {
		fireProjectile(player, list);
	} else {
		loadProjectile(player);
	}
	
	if(player.input.anchor) {
		player.box.dx = player.box.dy = 0;
	} else {
		// Handle undocking event
		if(player.docked) {
			player.docked = false;
			undocks.push(player);
		}
		// Apply wind collision
		if(player.input.sails && player.box.ddir === 0) {
			dot = ship.x * wind.x + ship.y * wind.y;
			vect = {
				x:dot * ship.x,
				y:dot * ship.y
			}
			player.box.collisions.push({
				vector:vect,
				mass:0.01 * player.box.mass,
				source:"the wind",
				damage:0
			});
		}
		// Apply water resistance
		vect = {
			x:0.005 * -player.box.dx,
			y:0.005 * -player.box.dy
		};
		player.box.collisions.push({
			vector:vect,
			mass:player.box.mass,
			source:"the sea",
			damage:0
		});
		// Apply force from turning
		player.box.dx += -player.box.dy * Math.sin(player.box.ddir);
		player.box.dy += player.box.dx * Math.sin(player.box.ddir);
	}
}

// Fire all projectiles the player has
function fireProjectile(player, list) {
	if(player.firingCount < 1) {
		player.firingCount += player.firingRate;
	} else {
		var proj = player.projectiles.pop(), proj2;
		if(!proj) return; // Cannons need to be reloaded
		proj = new projectile(player);
		if(player.input.firingLeft && player.input.firingRight) {
			proj2 = player.projectiles.pop();
			if(proj2) proj2 = new projectile(player);
		}
		var vect = {
			x:player.firepower * Math.cos(proj.box.dir),
			y:player.firepower * Math.sin(proj.box.dir)
		};
		// if firing left, fire proj out the left side
		// if also firing right, try to fire proj2 out right side
		// if only firing right, fire proj out right side
		if(player.input.firingLeft) {
			if(player.input.firingRight && proj2) {
				proj2.box.collisions.push({
					vector:{
						x:-vect.x,
						y:-vect.y
					},
					mass:proj2.box.mass,
					source:proj2.box.mass,
					damage:0
				});
				list.push(proj2);
				proj2.box.ddir = proj2.box.dir;
				player.diff.shotsFired++;
			}
		} else {
			vect.x = -vect.x;
			vect.y = -vect.y;
		}
		proj.box.collisions.push({
			vector:vect,
			mass:proj.box.mass,
			source:proj.box.mass,
			damage:0
		});
		list.push(proj);
		proj.box.ddir = proj.box.dir;
		player.diff.shotsFired++;
		player.firingCount = player.firingRate;
	}
}

function loadProjectile(player) {
	if(player.input.firingLeft || player.input.firingRight) return;
	if(player.projectiles.length < player.numCannons &&
		player.currentAmmo > 0) {
		if(player.reloadCount > 1) {
			player.projectiles.push({});
			player.currentAmmo--;
			player.reloadCount = 0;
		} else {
	   		player.reloadCount += player.reloadRate;
	   	}
	}
}



module.exports = new Game();

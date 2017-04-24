
var debug = require("./debug.js").game;
var log = require("./debug.js").log;

var server = require("./server.js");

var CLIENT_LIST = require("./router.js").client_list;
var GAME_SESSIONS = require("./session.js").GAME_SESSIONS;
var dbi = require("./dbi.js");

var projectile = require("./projectile.js");
var resource = require("./resource.js");
var ship = require("./ship.js");
var autopilot = require("./autopilot.js");

//============== GAME LOGIC =========================================


/**
* The game namespace contains the functions related to the
* game engine--processing input, updating the simulation,
* and emitting the game state.
* @module server/Game
*/
var Game = function() {}

// Event queues
var deaths = [];
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
    router.listen("gameInput", this.input);
    router.listen("selectShip", this.selectShip);
    router.listen("pushShipOrder", this.pushShipOrder);
    router.listen("clearShipOrders", this.clearShipOrders);
	router.listen("portInput", this.parsePortInput);
}

/**
* Updates the client's player input
* @param param - data passed by the router
* @param param.client - the client pressing keys
* @param param.data - the input object
* @memberof module:server/Game
*/
Game.prototype.input = function(param) {
    if (debug) log("server/game.js: input()");
    var p = param.client.player;
	if(!p) return;
    // Assign input data
    p.input = param.data;

    //if (debug) log("server/game.js: autocontrol="+p.input.autocontrol);
    
	for (var i in p.ships) {
	    if (p.ships[i].active && p.ships[i].selected) {
		p.ships[i].state = {
		    left:param.data.left,
		    right:param.data.right,
		    firingLeft:param.data.firingLeft,
		    firingRight:param.data.firingRight,
		    firingCount:p.ships[i].state.firingCount,
		    sails:param.data.sails,
		    anchor:param.data.anchor,
		    oars:param.data.oars,
		    autocontrol:param.data.autocontrol,
		    orders:param.data.orders,
			};
		}
	}

}

Game.prototype.parsePortInput = function(param) {
	var id = param.client.id;
	if(id === -1) return;
	var player = param.client.player;
	if(!player) return;
	var session = GAME_SESSIONS[id];
	var input = param.data;
	var ship = player.ships.find(function(s) {
		return s.name === input.ship;
	});
	if(input.name === "ammo") {
		ship.currentAmmo += session.ruleset.portAmmo;
		if(ship.currentAmmo > ship.maxAmmo) ship.currentAmmo = ship.maxAmmo;
		server.emit(param.client.socket, "alert", "Refilled ammo");
	}
	else if(input.name === "health") {
		ship.health += session.ruleset.portRepair;
		if(ship.health > ship.maxHealth) ship.health = ship.maxHealth;
		server.emit(param.client.socket, "alert", "Repaired ship");
	}
	server.emit(param.client.socket, "hidePortMenu", null);
}

Game.prototype.pushShipOrder = function(param) {
    if (debug) log("server/game.js: pushShipOrder()");
    var p = param.client.player;
	if(!p) return;

    if (param.data) {
	for (var i in p.ships) {
	    if (p.ships[i].selected)
		p.ships[i].state.orders.push(param.data);
	}
	
    }
}

Game.prototype.clearShipOrders = function(param) {
    if (debug) log("server/game.js: clearShipOrders()");
    var p = param.client.player;
	if(!p) return;

    var arr = [];
    for (var i in p.ships) {
	if (p.ships[i].selected)
	    p.ships[i].state.orders = [];
    }
}


Game.prototype.selectShip = function(param) {
	var client = param.client;
	var shipName = param.data;
	if(client.player) {
		for(var i in client.player.ships) {
			var s = client.player.ships[i];
		    s.selected = (s.name === shipName);
		}
	}
}

Game.prototype.selectNextShip = function(param) {
    var client = param.client;
    if (client.player) {
	
	var ships = client.player.ships;
	var current = ships.find(function(s) {
	    return s.selected;
	});
	if (current) {
	    var index = ships.indexOf(current);
	    if(++index >= ships.length) index = 0;
	    current.state = client.input;
	    current.selected = false;
	    ships[index].selected = true;
	    client.input = ships[index].state;
	    return ships[index].name;
	} else {
	    return "null";
	}
    }
    
    /*
	var client = param.client;
	var shipName = param.data;
	if(client.player) {
		for(var i in client.player.ships) {
			var s = client.player.ships[i];
		    s.selected = (s.name === shipName);
		}
	}
*/
}


/**
* The core game loop. Updates the ship positions
* and emits them to all clients.
* @memberof module:server/Game
*/
Game.prototype.update = function() {
    // Generate object with all ship positions
    for(var i in GAME_SESSIONS) {
		var session = GAME_SESSIONS[i];
		if(session.game.running) {
			// Init wind
			if(!session.game.wind) {
				session.game.wind = {
					x:Math.random() - Math.random(), 
					y:Math.random() - Math.random()
				};
			}
			var pack = {
				ships:[], 
				projectiles:[], 
				resources:[],
				wind:session.game.wind
			};
			// Reset collision data for this loop
			resetCollisionData(session);
			
			// Handle player inputs
			for(var j in session.game.players) {
				var p = session.game.players[j];
				if(!p.out) handleInput(p, session);
			}
			
			// Run the physics engine
			updatePhysics(session);
		    // Print the collision map
		    /*
			var txt = "";
			for(var i = 0; i < session.collisionData.length; i++) {
				for(var j = 0; j < session.collisionData[i].length; j++) {
					if(!!session.collisionData[i][j]) {
						txt += "1";
					} else {
						txt += "0";
					}
				}
				txt += "\n";
			}
			console.log(txt);
		    */
			// Spawn new entities
			updateSpawners(session);
			// Add the ship data to the packet
			for(var j in session.game.ships) {
			    var s = session.game.ships[j];
			    if(s.active) {
				/*
				var orders = [];
				for (var o in s.state.orders) {
				    var coords = null;
				    var target = null;
				    if (s.state.orders[o].coords) {
					coords = {x:s.state.orders[o].coords.x,
						  y:s.state.orders[o].coords.y};
				    }
				    if (s.state.orders[o].target)
					target = s.state.orders[o].target;

				    orders.push({name:s.state.orders[o].name,
						 coords:coords,
						 target:target});
				} */
				//console.log("game,pack: orders.len="+orders.length);
				pack.ships.push({
						name:s.name, 
						box:s.box, 
						state:s.state,
						health:s.health, 
						ammo:{
							loaded:s.projectiles.length,
						    unloaded:s.currentAmmo
						    
						},
				    	//orders:orders,

					    selected:s.selected,
						docked:s.docked
					});
				if(s.state.dead) s.active = false;

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
			    // mark currently selected client ship.
			    pack.myShip = -1;
			    for (var q in pack.ships) {
				if (pack.ships[q].name.split("-")[0] === c.player.name
				    && pack.ships[q].selected)
				    pack.myShip = q;
			    }
	   		    server.emit(c.socket, "gameUpdate", pack);
			}
		    }
		}
	}
	// Handle death events
	while(deaths.length > 0) {
		var d = deaths.pop();
		var parsedVictim = d.victim.split("-")[0];
		var parsedKiller = d.killer.split("-")[0];
		
		var victim = CLIENT_LIST.find(function(c) {
			return c.username === parsedVictim;
		});
		var killer = CLIENT_LIST.find(function(c) {
			return c.username === parsedKiller;
		});
		if(victim && victim.player) {
			server.emit(victim.socket, 
				"alert", "Your ship has been destroyed by " + parsedKiller);
			victim.player.diff.shipsLost = 1;
		}
		if(killer && killer.player) {
			server.emit(killer.socket, 
				"alert", "You have destroyed " + parsedVictim);
			killer.player.diff.shipsSunk = 1;
		}
	}
	// Handle resource pickup events
	while(transfers.length > 0) {
		var t = transfers.pop();
		var parsedRecip = t.recipient.split("-")[0];
		var client = CLIENT_LIST.find(function(c) {
			return c.username === parsedRecip;
		});
		if(client && client.player) {
			while(t.items.length > 0) {
				var item = t.items.pop();
				if(item.name === "ammo") {
					var ship = client.player.ships.find(function(s) {
						return s.name === t.recipient;
					});
					if(ship) ship.currentAmmo += item.amount;
					server.emit(client.socket, "alert", 
					"+ " + item.amount + " ammo");
				}
				// TO DO: Add more resource types here
			}
		}
	}
	// Handle docking events
	while(docks.length > 0) {
		var d = docks.pop();
		var parsedName = d.name.split("-")[0];
		var client = CLIENT_LIST.find(function(c) {
			return c.username === parsedName;
		});
		if(client) {
			var p = client.player;
		 	if(p && p.input.anchor) {
				var ship = p.ships.find(function(s) {
					return s.name === d.name;
				});
				if(ship && ship.selected && !ship.docked) {
					server.emit(client.socket, "alert", 
					"You are now docked at (" + 
						d.coords.x + ", " + d.coords.y + ")");
					ship.docked = true;
					server.emit(client.socket, "portMenu", 
					{ship:ship.name, coords:d.coords});
					// TO DO: more complex docking response
				}
			}
		}
	}
	// Handle undocking events
	while(undocks.length > 0) {
		var d = undocks.pop();
		var parsedName = d.name.split("-")[0];
		var client = CLIENT_LIST.find(function(c) {
			return c.username === parsedName;
		});
		if(client) {
			var p = client.player;
			if(p) {
				var ship = p.ships.find(function(s) {
					return s.name === d.name;
				});
				if(ship && ship.selected) {
					server.emit(client.socket, 
						"alert", "You have undocked from a port");
					server.emit(client.socket, "hidePortMenu", null);
				}
			}
		}
	}
}

/**
* Updates the "seconds played" and "distance sailed" stats
* for every ship currently in a game.
* @memberof module:server/Game
*/
Game.prototype.updateStats = function() {
	// Flag for stats emit
	var send = false;
	for(var i in GAME_SESSIONS) {
		var session = GAME_SESSIONS[i];
		if(!session.game.running) continue;
		var users = [];
		var stats = [];
		for(var j in session.game.players) {
			send = true;
			var p = session.game.players[j];
			// Add all ship diffs to player diff
			computePlayerDiff(p);
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
		}
		dbi.updateStats(users, stats, function(resp) {
			if(!resp && debug) {
				log("Failed to update stats");
			}
		});
	}
	// If any clients are in game
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
	changeWind(session.game.wind);
	var map = session.mapData;
	// Move ships / handle ship collisions / handle input
	for(var i in session.game.ships) {
		var ship = session.game.ships[i];
		if(!ship.active) continue;
		// Store x and y for stats tracking
		ship.prevX = ship.box.x;
		ship.prevY = ship.box.y;
		// Handle ship collisions
		handleCollisions(ship.box, session);
		// Update ship boxes
		var dmg = updateBox(ship.box, map);
		ship.health -= dmg.mag;
		if(ship.health < 0) handleDeath(ship, dmg.source);
	}
	// Calculate the diffs with the corrected boxes
	for(var i in session.game.ships) {
		var ship = session.game.ships[i];
		if(!ship.active) continue;
		var dx = ship.box.x - ship.prevX;
		var dy = ship.box.y - ship.prevY;
		var dist = Math.sqrt(dx * dx + dy * dy);
		ship.diff.distanceSailed += dist;
			
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
				var res = new resource(r.x, r.y, "ammo", session.ruleset);
				session.game.resources.push(res);
			}
		}
		r.blocked = false; // Reset for collision detect
	}
	for(var i in session.game.shipSpawns) {
		var s = session.game.shipSpawns[i];
		s.counter++;
		if(s.counter > 1000) {
			s.counter = 0;
			if(!s.blocked) {
				// Only first player for now -- TO DO
				var p = session.game.players[0];
				if(p.ships.length < 5) {
					var sh = new ship(p.name + "-" + p.ships.length, 
						s.x, s.y, session.ruleset);
					p.ships.push(sh);
					session.game.ships.push(sh);
				}
			}
		}
		s.blocked = false;
		
	}
}

// Apply wind fluctuations
function changeWind(wind) {
	var factor = 3 * Math.random();
	if(Math.random() > 0.5) {
		wind.x += 0.01 * factor;
	} else {
		wind.x -= 0.01 * factor;
	}
	if(Math.random() > 0.5) {
		wind.y += 0.01 * factor;
	} else {
		wind.y -= 0.01 * factor;
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
		// Mark the collision map at this vert's location
		updateCollisionData(session, cell_x, cell_y);
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
		//var norm = vect.x*vect.x + vect.y*vect.y;
		//var dot = vect.x * box.dx + vect.y*box.dy;
		//vect.x *= box.dx/norm;
		//vect.y *= box.dy/norm;
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
			name:box.name, 
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
		for(var j in session.game.ships) {
			var s = session.game.ships[j];
			
			if(!s.active || 
				s.name === box.name ||
				s.box === box) continue;
				
			// Prevent friendly fire if necessary
			if(!session.ruleset.friendlyFire &&
				s.name.split("-")[0] === box.name.split("-")[0]) 
				continue;
				
			if((Math.abs(v[i].x - s.box.x) < s.box.w) &&
				(Math.abs(v[i].y - s.box.y) < s.box.h)) {
				v[i].hit = true;
			    //var norm = vect.x*vect.x + vect.y*vect.y;
			    //var dot = vect.x * s.box.dx + vect.y*s.box.dy;
			    //vect.x *= s.box.dx/norm;
			    //vect.y *= s.box.dy/norm;
			    // Impulse of s.box on box
				box.collisions.push({
					vector:vect,
					mass:s.box.mass,
					source:s.box.name,
					damage:0
				});
			    //norm = opp_vect.x*opp_vect.x + opp_vect.y*opp_vect.y;
			    //dot = opp_vect.x * box.dx + opp_vect.y*box.dy;
			    //opp_vect.x *= box.dx/norm;
			    //opp_vect.y *= box.dy/norm;

				// Impulse of box on s.box
				s.box.collisions.push({
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
			    //var norm = vect.x*vect.x + vect.y*vect.y;
			    //var dot = vect.x * r.box.dx + vect.y*r.box.dy;
			    //vect.x *= r.box.dx/norm;
			    //vect.y *= r.box.dy/norm;

				box.collisions.push({
					vector:vect,
					mass:r.box.mass,
					source:r.box.name,
					damage:0
				});
			    //opp_vect.x *= box.dx/norm;
			    //opp_vect.y *= box.dy/norm;
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

// Takes ship victim and string killer
function handleDeath(victim, killer) {
	victim.health = 0;
	victim.alive = false;
	victim.state.dead = true;
	//victim.active = false;	// STATS TRACKING BUG <----
	deaths.push({
		victim:victim.name, 
		killer:killer
	});
       
}

function updateBox(box) {
	// For each collision
    var dmg = {mag:0, source:""};
    var dx = 0;
    var dy = 0;
    var dm = 0;
    var dx0 = 0;
    var dy0 = 0;
	while(box.collisions.length > 0){
		var c = box.collisions.pop();
		// Apply damage
		if(c.damage > 0) {
			dmg.mag += c.damage;
		    dmg.source = c.source;
		}
	    if (c.source === "the wind"
	       || c.source === "the sea" ) {
	    // Apply impulse
		dx0 += c.vector.x * c.mass / box.mass;
		dy0 += c.vector.y * c.mass / box.mass;
	    } else {
		dx += c.mass * c.vector.x;
		dy += c.mass * c.vector.y;
		dm += c.mass;
	    }
	}

    if (dm > 0) {
	box.dx = (box.mass * box.dx + dx) / (box.mass + dm);
	box.dy = (box.mass * box.dy + dy) / (box.mass + dm);
    } else {
	box.dx += dx0;
	box.dy += dy0;
    }
    
    /*
    var cos = Math.cos(box.dir);
    var sin = Math.sin(box.dir);
    var dot = box.dx*cos + box.dy*sin;
    if (dot < 0) {
	box.dx *= 0.001*cos;
	box.dy *= 0.001*sin;
    } else {
	box.dx *= cos;
	box.dy *= sin;
    }
    */
    
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
	
	for(var i in player.ships) {
	    var ship = player.ships[i];
	    // Get input from either the player or autopilot
	    var input ={
		left:false,
		right:false,
		firingLeft:false,
		firingRight:false,
		sails:false,
		oars:false,
		anchor:false,
		swap:false,
		autocontrol:true
	    };

	    if (ship.selected && ! (player.input.autocontrol) ) {
		input = player.input;
	    } else {
		autopilot.getInput(input,ship,session);
	    }

		// Rotate
		if(input.right) {
			ship.box.dir += 0.03;
			ship.box.ddir = 0.03;
		}
		if(input.left) {
			ship.box.dir -= 0.03;
			ship.box.ddir = -0.03;
		}
	
		// Fire / load projectiles
		if(input.firingLeft || input.firingRight) {
			fireProjectile(
				ship, session,
				input.firingLeft, 
				input.firingRight
			);
		} else {
			loadProjectile(ship);
		}
	
		// Weigh / drop anchor
		if(input.anchor) {
			ship.box.dx = ship.box.dy = 0;
		} else {
			// Handle undocking event
			if(ship.docked) {
				ship.docked = false;
				undocks.push({name:ship.name});
			}
			// Apply water resistance
			var vect = {
				x:0.005 * -ship.box.dx,
				y:0.005 * -ship.box.dy
			};
			ship.box.collisions.push({
				vector:vect,
				mass:ship.box.mass,
				source:"the sea",
				damage:0
			});
			// Apply wind collision
			if(input.sails && ship.box.ddir === 0) {
				var ship_dir = {
					x:Math.cos(ship.box.dir),
					y:Math.sin(ship.box.dir)
				};
			    var dot = ship_dir.x * wind.x + ship_dir.y * wind.y;
			    if (dot < 0) dot = 0;
				vect = {
					x:dot * ship_dir.x,
					y:dot * ship_dir.y
				}
				ship.box.collisions.push({
					vector:vect,
					mass:0.01 * ship.box.mass,
					source:"the wind",
					damage:0
				});
			    
			}
			// Apply force from rowing
			if(input.oars && ship.box.ddir === 0) {
				ship.box.dx = Math.cos(ship.box.dir) * 
				session.ruleset.rowSpeed;
				ship.box.dy = Math.sin(ship.box.dir) * 
				session.ruleset.rowSpeed;
			}
			// Apply force from turning
			ship.box.dx += -ship.box.dy * Math.sin(ship.box.ddir);
			ship.box.dy += ship.box.dx * Math.sin(ship.box.ddir);
		}
	    ship.state.left = input.left;
	    ship.state.right = input.right;
	    ship.state.firingLeft = input.firingLeft;
	    ship.state.firingRight = input.firingRight;
	    ship.state.sails = input.sails;
	    ship.state.anchor = input.anchor;
	    ship.state.oars = input.oars;
	    ship.state.autocontrol = input.autocontrol;
	}
}

// Resets the collision map to portray just the terrain
function resetCollisionData(session) {
	var map = session.mapData;
	if(!map) return;

    
	var cmap = [];
	for(var i = 0; i < map.height; i++) {
		var row = [];
		for(var j = 0; j < map.width; j++) {
			var ch = map.data[i].charAt(j);
			row.push(!!(!ch || ch === "1" || ch === "2" || ch === "3"));
		}
		cmap.push(row);
	}
    session.collisionData = cmap;
}

// Flags the collision data at the given x and y
function updateCollisionData(session, x, y) {
	if(!session.mapData || !session.collisionData) return;
	if(x > -1 && x < session.mapData.width &&
		y > -1 && y < session.mapData.height) {
	    session.collisionData[y][x] = true;
	}
}

// Create new projectiles, push to list, launch left or right or both
function fireProjectile(ship, session, left, right) {
	if(!ship) return;
	if(ship.state.firingCount < 1) {
		ship.state.firingCount += ship.firingRate;
	} else {
		var proj = ship.projectiles.pop(), proj2;
		if(!proj) return; // Cannons need to be reloaded
		proj = new projectile(ship, session.ruleset);
		if(left && right) {
			proj2 = ship.projectiles.pop();
			if(proj2) proj2 = new projectile(ship, session.ruleset);
		}
		var vect = {
			x:ship.firepower * Math.cos(proj.box.dir),
			y:ship.firepower * Math.sin(proj.box.dir)
		};
		// if firing left, fire proj out the left side
		// if also firing right, try to fire proj2 out right side
		// if only firing right, fire proj out right side
		if(left) {
			if(right && proj2) {
				proj2.box.collisions.push({
					vector:{
						x:-vect.x,
						y:-vect.y
					},
					mass:proj2.box.mass,
					source:proj2.box.mass,
					damage:0
				});
				session.game.projectiles.push(proj2);
				proj2.box.ddir = proj2.box.dir;
				ship.diff.shotsFired++;
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
		session.game.projectiles.push(proj);
		proj.box.ddir = proj.box.dir;
		ship.diff.shotsFired++;
		ship.state.firingCount = 0;
	}
}

function loadProjectile(ship) {
	if(ship.projectiles.length < ship.numCannons &&
		ship.currentAmmo > 0) {
		if(ship.reloadCount > 1) {
			ship.projectiles.push({});
			ship.currentAmmo--;
			ship.reloadCount = 0;
		} else {
	   		ship.reloadCount += ship.reloadRate;
	   	}
	}
}

// Sums the diffs of all ships owned by player
// and adds to player's diff
function computePlayerDiff(player) {
	for(var i in player.ships) {
		var s = player.ships[i];
		player.diff.distanceSailed += s.diff.distanceSailed;
		player.diff.shotsFired += s.diff.shotsFired;
		player.diff.shipsSunk += s.diff.shipsSunk;
	}
}

module.exports = new Game();

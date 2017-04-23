
var debug = require("./debug.js").autopilot;
var log = require("./debug.js").log;

var Heap = require("./heap.js");

var AutoPilot = function () {}

// Decision making algorithm.
// Takes a ship object and a given game session
// and returns the proper input object.
var mapw = 0;
var maph = 0;
var graph = [];
var landmap = [];
AutoPilot.prototype.getInput = function(input, ship, session) {
    
    if (debug) if (! ship.orders) log("server/autopilot.js: !ship.orders");
    
    if (! ship.orders || ship.orders.length === 0) {
	input.sails = false;
	return;
    }
    
    var order = ship.orders[0];

    if (! order) {
	return;
    }

    if (order.name === "goto") {

	if (session.mapData.height !== maph ||
	    session.mapData.width !== mapw) {
	    mapw = session.mapData.width;
	    maph = session.mapData.height;
	    graph = init_graph();
	    landmap = init_landmap(session);
	}
	
	if (check_linear(ship.box.x,ship.box.y,
			 order.coords.x,order.coords.y)) {
	    seekPosition(order.coords.x,order.coords.y,
			 ship,session,input);
	} else {
	    
	    var q = new Heap();
	    
	    var x0 = Math.round(ship.box.x);
	    var y0 = Math.round(ship.box.y);
	    var targetx = Math.round(order.coords.x);
	    var targety = Math.round(order.coords.y);
	    
	    init_heap(q,x0,y0);
	    
	    var path = dijkstra(q,targetx,targety);
	    
	    var tx,ty;
	    
	    //smooth path
	    if (path.length > 2) {
		var n = 2;
		while (n < path.length-1 &&
		       (path[n].x-path[n-1].x)*(path[n-1].y-path[n-2].y) ==
		       (path[n].y-path[n-1].y)*(path[n-1].x-path[n-2].x)) {
		    n++;
		}
		
		tx = (path[n].x+path[n-1].x)*0.5;
		ty = (path[n].y+path[n-1].y)*0.5;
	    } else {
		tx = order.coords.x;
		ty = order.coords.y;
	    }
	    seekPosition(tx,ty,ship,session,input);
	}	
    } else {
	var target_ship = null;
	for (var i in session.game.players) {
	    target_ship = session.game.players[i].ships.find(function(s) {
		return s.name === order.target;
	    });
	    if (target_ship) break;
	}

	if (false && debug && target_ship) 
	    log("server/autopilot.js: target_ship name: "+target_ship.name);
	if (target_ship) {
	    if (!target_ship.active) {
		ship.orders.shift();
		return;
	    }

	    var tx = target_ship.box.x;
	    var ty = target_ship.box.y;
	    var tdir = target_ship.box.dir;
	    
	    if (order.name === "fire") {
		
		ship.orders[0].coords = {x:tx,y:ty};
		fireAt(tx,ty,tdir,ship,session,input);
		if (input.anchor == true) {
		    ship.orders.push({name:"fire",target:target_ship.name,coords:{x:tx,y:ty}});
		}


	    } else if (order.name === "follow") {

		var x1 = tx-3*ship.box.w*Math.cos(tdir);
		var y1 = ty-3*ship.box.w*Math.sin(tdir);
		var dx = ship.box.x - x1;
		var dy = ship.box.y - y1;
		ship.orders[0].coords = {x:x1,y:y1};

		if (dx*dx + dy*dy > 5) {
		    seekPosition(x1,y1,ship,session,input);
		} else {
		    var dirx = ship.box.x - ship.prevX;
		    var diry = ship.box.y - ship.prevY;
		    var dir = ship.box.dir;
		    if (dirx != 0 || diry != 0)
			dir = Math.atan2(diry,dirx);
		    var diff = dir - tdir;
		    if (diff < -0.03) input.right = true;
		    else if (diff > 0.03) input.left = true;
		}
		    
	    } else if (order.name === "ram") {
		ship.orders[0].coords = {x:tx,y:ty};
		seekPosition(tx,ty,ship,session,input);
	    }
	}
    }
    
}

function fireAt(x,y,tdir,ship,session,input) {

	var c = Math.cos(tdir);
	var s = Math.sin(tdir);
	var t1x = x + s*15;
	var t1y = y - c*15;
	var t2x = x - s*15;
	var t2y = y + c*15;
	var s1x = ship.box.x-t1x;
	var s1y = ship.box.y-t1y;
	var s2x = ship.box.x-t2x;
	var s2y = ship.box.y-t2y;
	var tx, ty;
    if (s1x*s1x+s1y*s1y < s2x*s2x+s2y*s2y) {
	    if (Math.abs(s1x) + Math.abs(s1y) < 5) {
		var ddir = tdir - ship.box.dir;
		// swing cannons into range
		if (ddir > 0.06) {
		    input.right = true;
		} else if (ddir < -0.06) {
		    input.left = true;
		} else {
		    if (ddir > 0) input.firingLeft = true;
		    else input.firingRight = true;
		}
		
	    } else {
		seekPosition(t1x,t1y,ship,session,input);
	    }
	    
    } else {
	    if (Math.abs(s2x) + Math.abs(s2y) < 5) {
		var ddir = tdir - ship.box.dir;
		// swing cannons into range
		if (ddir > 0.06) {
		    input.right = true;
		} else if (ddir < -0.06) {
		    input.left = true;
		} else {
		    if (ddir > 0) input.firingLeft = true;
		    else input.firingRight = true;
		}
	    } else {
		seekPosition(t2x,t2y,ship,session,input);
	    }

    }
    
}

function seekPosition(x,y,ship,session,input) {

	var x0 = ship.box.x;
	var y0 = ship.box.y;
	var nx = x - x0;
	var ny = y - y0;

    input.sails = true;
	
	if (Math.abs(nx) + Math.abs(ny) < 1) {
	    ship.orders.shift();
	    input.anchor = true;
	    input.sails = false;

	} else {
	    // if moving, use vx,vy to steer.
	    var vx = ship.box.x - ship.prevX;
	    var vy = ship.box.y - ship.prevY;	    
	    if (Math.abs(vx)+Math.abs(vy) < 0.01) {
		// if not moving, turn sails to the wind.
		input.sails = false;
		input.oars = true;
		vx = Math.cos(ship.box.dir);
		vy = Math.sin(ship.box.dir);
	    }
	    var v = Math.sqrt(vx*vx+vy*vy);
	    vx /= v;
	    vy /= v;
	    var norm = Math.sqrt(nx*nx+ny*ny);
	    nx /= norm;
	    ny /= norm;
		
	    var cross = nx*vy - ny*vx;
	    if (cross > 0.03) {
		//if (debug) log("AP: "+ship.name+", seekpos(): LEFT; cross="+cross+"; v=("+vx+","+vy+"),"+v+"; n=("+nx+","+ny+"),"+norm+"; sails="+input.sails); 
		input.left = true;
	    } else if (cross < -0.03) {
		//if (debug) log("AP: "+ship.name+", seekpos(): RIGHT; cross="+cross+"; v=("+vx+","+vy+"),"+v+"; n=("+nx+","+ny+"),"+norm+"; sails="+input.sails); 
		input.right = true;
	    } 
	}
}


// dijkstra
// based on wikipedia pseudocode
function dijkstra(q,tx,ty) {

    var n,ind,vert,dist,edgelist,edge,newdist;
    
    while (q.array.length > 0) {
	vert = q.pop();
	// note: vert holds target vert at loop exit
	if (vert.x === tx &&
	    vert.y === ty) {
	    break;
	}
	dist = graph[vert.y+mapw*vert.x].d; 
	edgelist = graph[vert.y + mapw*vert.x].edgelist;
	
	for (n in edgelist) {
	    edge = edgelist[n];
	    ind = edge.y + mapw*edge.x;
	    
	    if (landmap[ind]) {
		newdist = dist + edge.wt;
		if (newdist <= graph[ind].d) {		    
		    q.remove({x:edge.x,y:edge.y,d:graph[ind].d});
		    q.push({x:edge.x,
			    y:edge.y,
			    d:newdist});

		    graph[ind].d = newdist;
		    graph[ind].prevx = vert.x;
		    graph[ind].prevy = vert.y;
		    

		}
	    }
	}
    }

    var path = [];
    var a,b,ind;
    if (graph[ty+mapw*tx].prevx && graph[ty+mapw*tx].prevy) {
	var a = tx;
	var b = ty;
	var ind = b + mapw*a;
	while (graph[ind].prevx && graph[ind].prevy) {
	    path.unshift({x:a,y:b,d:graph[ind].d});
	    a = graph[ind].prevx;
	    b = graph[ind].prevy;
	    ind = b + mapw*a;
	}
    } 
        
    return path;
    
}

var BIG = 99999999;

//called once per session
function init_graph() {

    var grph = [];
    
    for (var x = 0 ; x < maph; x++) {
	for (var y = 0; y < mapw; y++) {
	    grph.push({d:BIG,edgelist:[]});
	}
    }
    
    for (var x = 0 ; x < maph; x++) {
	for (var y = 0; y < mapw; y++) {
	    
	    for (var i = -1; i <= 1; i++) {
		if (y+i >= 0 && y+i < mapw) {
		    
		    for (var j = -1; j<= 1; j++)
			if ((i !== 0 || j !==0 ) && x+j >= 0 && x+j < maph) {
			    grph[y+mapw*x].edgelist.push({x:x+j,
							  y:y+i,
							  wt:Math.sqrt(i*i+j*j)});
			}
		}
	    }
	}
    }
    return grph;
}

function init_heap(q,x0,y0) {
    
    q.array.splice(0,q.array.length);
    q.push({x:x0,y:y0,d:0});
    var x,y,ind;
    for (x = 0 ; x < maph; x++) {
	for (y = 0; y < mapw; y++) {
	    ind = y + x*mapw;
	    graph[ind].d = BIG;
	    graph[ind].prevx = null;
	    graph[ind].prevy = null;
	}
    }
    graph[y0+x0*mapw].d = 0;
    
}

function check_linear(x0,y0,tx,ty) {    

    var x1,x2,y1,y2;

    if (Math.abs(tx-x0) > Math.abs(ty-y0)) {

	if (ty > y0) {
	    y2 = Math.round(ty);
	    y1 = Math.round(y0);
	} else {
	    y2 = Math.round(y0);
	    y1 = Math.round(ty);
	}
	if (tx > x0) {
	    x2 = Math.round(tx);
	    x1 = Math.round(x0);
	} else {
	    x2 = Math.round(x0);
	    x1 = Math.round(tx);
	}
	
	if (x2 === x1) return false;

	var dy = (y2 - y1)/(x2 - x1);

	var i;
	var j = y1;

	for (i = x1; i <= x2; i++) {
	    j += dy;
	    if (! (landmap[Math.floor(j) + mapw*i]))
		return false;
	}
	return true;
    }

    if (tx > x0) {
	y2 = Math.round(tx);
	y1 = Math.round(x0);
    } else {
	y2 = Math.round(x0);
	y1 = Math.round(tx);
    }
    if (ty > y0) {
	x2 = Math.round(ty);
	x1 = Math.round(y0);
    } else {
	x2 = Math.round(y0);
	x1 = Math.round(ty);
    }
    
    if (x2 === x1) return false;
    
    var dy = (y2 - y1)/(x2 - x1);
    
    var i;
    var j = y1;
    
    for (i = x1; i <= x2; i++) {
	j += dy;
	if (! (landmap[i + mapw*Math.floor(j)]))
	    return false;
    }
    return true;
    
}


function init_landmap(session) {

    var lmap = [];
    var map = session.mapData;
    var ch, i, j, f, g;
    for (i = 0; i < maph*mapw; i++) lmap.push(true);

    var buffer = 5;

    for (j = 0; j < mapw; j++) {
	for (i = 0; i < maph; i++) {
	    ch = map.data[j].charAt(i);
	    if (ch === "1" || ch === "2" || ch === "3") {
		lmap[j + mapw*i] = false;
		for (f = -buffer; f < buffer ; f++) {
		    if (j + f >= 0 && j+f < mapw) {
			for (g = -buffer; g < buffer; g++) {
			    if (i + g >= 0 && i+g < maph) {
				lmap[j+g+mapw*(i+f)] = false;
			    }
			}
		    }
		}
	    }
	}
    }
    
    for (i = 0; i < maph; i++) {
	for (f = 0; f<buffer; f++) {
	    lmap[f+mapw*i] = false;
	    lmap[mapw-1-f+mapw*i] = false;
	}
    }

    for (j = 0; j < mapw; j++) {
	for (f = 0; f < buffer; f++) {
	    lmap[j + mapw*f] = false;
	    lmap[j+mapw*(maph-1-f)] = false;
	}
    }

    return lmap;
    
}


module.exports = new AutoPilot();



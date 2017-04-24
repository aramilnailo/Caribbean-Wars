
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
var timelag = 500;
AutoPilot.prototype.getInput = function(input, ship, session) {
    
    if (debug) if (! ship.state.orders) log("server/autopilot.js: !ship.orders");

    var orders = ship.state.orders;
    
    if (! orders || orders.length === 0) {
	input.sails = false;
	return;
    }
    
    var order = orders[0];

    if (! order) {
	return;
    }

    if (order.name === "goto") {
	var step = autonav(input,ship,
			   order.coords.x,
			   order.coords.y,
			   session);
	seekPosition(step.x,step.y,ship,session,input);
	if (input.anchor && ship.path.length < 3) {
	    ship.lastpathcalc = -1;
	    if (ship.path.length > 0) {
		ship.path.splice(0,ship.path.length -1);
	    }
	}
    } else {
	//console.log ("processing non-goto");
	var target_ship = null;
	for (var i in session.game.players) {
	    target_ship = session.game.players[i].ships.find(function(s) {
		return s.name === order.target;
	    });
	    if (target_ship) break;
	}

	if (order.name === "fire") {
	    if (target_ship) {
		
		var step = autonav(input,ship,
				   target_ship.box.x,
				   target_ship.box.y,
				   session);
		
		var tx = step.x; //target_ship.box.x;
		var ty = step.y; //target_ship.box.y;
		var tdir = target_ship.box.dir;

		ship.state.orders[0].coords = {x:tx,y:ty};
		fireAt(tx,ty,tdir,ship,session,input);
		if (input.anchor == true) {
		    ship.state.orders.push({name:"fire",
				      target:target_ship.name,
				      coords:{x:tx,y:ty}});
		    ship.lastpathcalc = -1;
		    if (ship.path.length > 0) {
			ship.path.splice(0,ship.path.length -1);
		    }
		}
	    } else {
		ship.state.orders.shift();
		ship.lastpathcalc = -1;
		if (ship.path.length > 0) {
		    ship.path.splice(0,ship.path.length -1);
		}
	    }
	    
	} else if (order.name === "unfollow") {
	    //console.log("AP call to unfollow");	    
	    target_ship.follower = ship.follower;

	    if (ship.follower !== null){
		var following_ship = null;
		for (var i in session.game.players) {
		    following_ship = session.game.players[i].ships.find(function(s) {
			return s.name === ship.follower;
		    });
		    if (following_ship) break;
		}
		if (following_ship) {
		    following_ship.following = target_ship.name;
		}
		ship.follower = null;
	    }
	    
	    ship.following = null;
	    ship.state.orders.splice(0,1);
	    ship.lastpathcalc = -1;
	    if (ship.path.length > 0) {
		ship.path.splice(0,ship.path.length -1);
	    }
	    
	} else if (order.name === "follow") {
	    //console.log("AP call to follow");
	    follow(input,ship,target_ship,session);
	    
	} else if (order.name === "ram") {
	    //console.log("AP call to ram");
	    if (target_ship) {
		
		var step = autonav(input,ship,
				   target_ship.box.x,
				   target_ship.box.y,
				   session);
		
		var tx = step.x; //target_ship.box.x;
		var ty = step.y; //target_ship.box.y;
		
		ship.state.orders[0].coords = {x:tx,y:ty};
		seekPosition(tx,ty,ship,session,input);
		if (input.anchor) {
		    ship.lastpathcalc = -1;
		    if (ship.path.length > 0) {
			ship.path.splice(0,ship.path.length -1);
		    }
		}
	    } else {
		ship.state.orders.shift();
		ship.lastpathcalc = -1;
		if (ship.path.length > 0) {
		    ship.path.splice(0,ship.path.length -1);
		}
		
	    }
	} //ram
    }
}
    
function follow(input,ship,target_ship,session) {

    if (target_ship) {
	
	if (target_ship.active) {
	    
	    // if not already in queue,
	    // add to end of queue
	    
	    if (ship.following === null
		|| ship.following === undefined) {
		//console.log("enter first follow loop; target="+target_ship.name);	
		while (target_ship.follower) {
		    var ship_to_follow = target_ship;
		    for (var i in session.game.players) {
			ship_to_follow = session.game.players[i].ships.find(function(s) {
			    return s.name === target_ship.follower;
			});
			if (ship_to_follow
			    && ship_to_follow.active) {
			    target_ship = ship_to_follow;
			    break;
			}
		    }
		    
		}
		//console.log("exit first follow loop; target="+target_ship.name);	
		ship.state.orders[0].target = target_ship.name;
		target_ship.follower = ship.name;
		ship.following = target_ship.name;
		
		
	    }
	    
	} else { // ... target ship is inactive.
	    
	    // leapfrog the ship up front
	    if (target_ship.following) {
		
		var ship_to_follow = target_ship;

		//console.log("enter follow loop");
		while (ship_to_follow &&
		       ship_to_follow.following &&
		       ! ship_to_follow.active) {
		    for (var i in session.game.players) {
			ship_to_follow = session.game.players[i].ships.find(function(s) {
			    return s.name === target_ship.following;
			});
			
			if (ship_to_follow) {
			    target_ship = ship_to_follow;
			    break;
			}
		    }
		}
		//console.log("exit follow loop");
		if (target_ship) {
		    ship.following = target_ship.name;
		    target_ship.follower = ship.name;
		} else {
		    ship.following = null;
		    ship.state.orders.splice(0,1);
		    ship.lastpathcalc = -1;
		    if (ship.path.length > 0) {
			ship.path.splice(0,ship.path.length -1);
		    }
		    return;		    
		}
		
	    } else { // uncouple.
		//console.log("follow: uncoupling");
		target_ship.follower = null;
		ship.following = null;
		ship.state.orders.shift();
		ship.lastpathcalc = -1;
		if (ship.path.length > 0) {
		    ship.path.splice(0,ship.path.length -1);
		}
		return;
	    }
	}

	//console.log(" "+ship.name+": target="+target_ship.name+"; following="+ship.following+"; follower="+ship.follower);
	
	var step = autonav(input,ship,
			   target_ship.box.x,
			   target_ship.box.y,
			   session);
	
	var tx = step.x; //target_ship.box.x;
	var ty = step.y; //target_ship.box.y;
	var tdir = target_ship.box.dir;
	
	
	var x1 = tx-3*ship.box.w*Math.cos(tdir);
	var y1 = ty-3*ship.box.w*Math.sin(tdir);
	var dx = ship.box.x - x1;
	var dy = ship.box.y - y1;
	ship.state.orders[0].coords = {x:x1,y:y1};
	
	if (dx*dx + dy*dy > 5) {
	    seekPosition(x1,y1,ship,session,input);
	    if (input.anchor == true) {
		ship.lastpathcalc = -1;
		if (ship.path.length > 0)
		    ship.path.splice(0,ship.path.length -1);
	    }
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
	
    } else { //target_ship is undefd or null
	ship.following = null;
	ship.state.orders.splice(0,1);
	ship.lastpathcalc = -1;
	if (ship.path.length > 0) {
	    ship.path.splice(0,ship.path.length -1);
	}
    }
}

function autonav(input,ship,target_x,target_y,session) {

    var order = ship.state.orders[0];
    
    if (session.mapData.height !== maph ||
	session.mapData.width !== mapw) {
	mapw = session.mapData.width;
	maph = session.mapData.height;
	graph = init_graph();
	landmap = init_landmap(session);
    }
    
    if (check_linear(ship.box.x,ship.box.y,
		     target_x,target_y)) {
	return {x:target_x,y:target_y};
	/*
	seekPosition(target_x,target_y,ship,session,input);
	ship.lastpathcalc = -1;
	if (ship.path.length > 0) {
	    ship.path.splice(0,ship.path.length -1);
	}
	return {x:-1,y:-1};
*/
    } else {

	if ( ship.lastpathcalc > timelag  ||
	     ship.lastpathcalc < 0) {

	    ship.lastpathcalc = 0;
	    
	    var q = new Heap();
	    
	    var x0 = Math.round(ship.box.x);
	    var y0 = Math.round(ship.box.y);
	    var targetx = Math.round(target_x);
	    var targety = Math.round(target_y);
	    
	    //console.log("init_heap; lastpathcalc="+ship.lastpathcalc);
	    init_heap(q,x0,y0);

	    //console.log("dijkstra; lastpathcalc="+ship.lastpathcalc);
	    ship.path = dijkstra(q,targetx,targety);
	    
	} else
	    ship.lastpathcalc++;

	
	
	// in the event that collisions knock the
	// ship off course, find the nearest path vertex
	/// ... seems problematic
	/*
	if (ship.path.length > 3) {
	    var path = ship.path;
	    var px = path[ship.path.length-1].x-ship.box.x;
	    var py = path[ship.path.length-1].y-ship.box.y;
	    var lastdelta = px*px+py*py;
	    for (var n = ship.path.length - 2; n > 0; n--) {
		px = path[n].x-ship.box.x;
		py = path[n].y-ship.box.y;
		var delta = px*px+py*py;
		if (delta > lastdelta) break;
		else lastdelta = delta;
	    }
	    if (n > 0) 
		ship.path.splice(0,n);
	}
*/

	for (var n = 0; n < ship.path.length; n++) {
	    if (Math.abs(ship.box.x - ship.path[n].x)
		+ Math.abs(ship.box.y - ship.path[n].y) < 2)
		ship.path.splice(n,1);
	}

	
	var tx,ty;
	//smooth path
	if (ship.path.length > 2) {
	    var n = 2;
	    var deltaxn = ship.path[n].x-ship.path[n-1].x;
	    var deltayn = ship.path[n].y-ship.path[n-1].y;
	    var deltaxm = ship.path[n-1].x-ship.path[n-2].x;
	    var deltaym = ship.path[n-1].y-ship.path[n-2].y;
	    while (n < ship.path.length-1 &&
		   deltaxn*deltaym == deltaxm*deltayn ) {
		deltaxm = deltaxn;
		deltaym = deltayn;
		n++;
		deltaxn = ship.path[n].x-ship.path[n-1].x;
		deltayn = ship.path[n].y-ship.path[n-1].y;
	    }
/*
		   (ship.path[n].x-ship.path[n-1].x)*(ship.path[n-1].y-ship.path[n-2].y) ==
		   (ship.path[n].y-ship.path[n-1].y)*(ship.path[n-1].x-ship.path[n-2].x)) {
		n++;
	    } */
	    
	    tx = (ship.path[n].x+ship.path[n-1].x)*0.5;
	    ty = (ship.path[n].y+ship.path[n-1].y)*0.5;
	} else {
	    tx = target_x;
	    ty = target_y;
	}
	return {x:tx,y:ty};
	
    }	
}

function fireAt(x,y,tdir,ship,session,input) {
    console.log("AP call to fireAt");
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
		ship.lastpathcalc = -1;
		if (ship.path.length > 0) {
		    ship.path.splice(0,ship.path.length -1);
		}
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
		ship.lastpathcalc = -1;
		if (ship.path.length > 0) {
		    ship.path.splice(0,ship.path.length -1);
		}
	    }
    }
    
}

function seekPosition(x,y,ship,session,input) {

	var x0 = ship.box.x;
	var y0 = ship.box.y;
	var nx = x - x0;
	var ny = y - y0;

    if (session.game.wind.x*Math.cos(ship.box.dir) +
	session.game.wind.y*Math.sin(ship.box.dir) < 0) {
	input.sails = false;
	input.oars = true;
    } else {
    	input.sails = true;
	input.oars = false;
    }
    
	if (Math.abs(nx) + Math.abs(ny) < 2) {
	    ship.state.orders.shift();
	    input.anchor = true;
	    input.sails = false;
	    input.oars = false;

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



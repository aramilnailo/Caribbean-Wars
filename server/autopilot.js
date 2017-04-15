var debug = require("./debug.js").autopilot;
var log = require("./debug.js").log;


var AutoPilot = function () {}

// Decision making algorithm.
// Takes a ship object and a given game session
// and returns the proper input object.
AutoPilot.prototype.getInput = function(ship, session) {

    var input = { left:false,
		  right:false,
		  firingLeft:false,
		  firingRight:false,
		  sails:false,
		  oars:false,
		  anchor:false,
		  swap:false
		};

    //if (debug) log("server/autopilot.js: ship="+ship.name+"; getInput()");
    if (debug) if (! ship.orders) log("server/autopilot.js: !ship.orders");
    
    if (! ship.orders || ship.orders.length === 0) {
	//if(debug) log("server/autopilot.js: ship="+ship.name+"; no orders");
	return input;
    }
    
    //if (debug) log("server/autopilot.js: orders.length = "+ship.orders.length);
    var order = ship.orders[0];


    if (! order) {
	return input;
    }

    
    if (order.name === "goto")
	seekPosition(order.coords.x,order.coords.y,ship,session,input);
    else {
	var target;
	for (var i in session.game.players) {
	    target = session.game.players[i].ships.find(function(s) {
		return s.name === order.target;
	    });
	    if (target) break;
	}

	if (target) {
	    var tx = target.box.x;
	    var ty = target.box.y;
	    var tdir = target.box.dir;

	    if (order.name === "fire") {

		fireAt(tx,ty,tdir,ship,session,input);
		
	    } else if (order.name === "follow") {
		
		var x1 = tx-20*Math.cos(tdir);
		var y1 = ty-20*Math.sin(tdir);
		var dx = ship.box.x - tx;
		var dy = ship.box.y - ty;
		if (dx*dx + dy*dy > 5)
		    seekPosition(x1,y1,ship,session,input);
		else {
		    var diff = dir - tdir;
		    if (diff < -0.03) input.right = true;
		    else if (diff > 0.03) input.left = true;
		}
		    
	    } else if (order.name === "ram") {
		seekPosition(tx,ty,ship,session,input);
	    }
	}
    }

    
    return input;
    
}

function fireAt(x,y,tdir,ship,session,input) {

    var fx = x - ship.box.x;
    var fy = y - ship.box.y;
    if (fx*fx + fy*fy < 20) {
	var ddir = dir - ship.box.dir;
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
	    tx = t1x;
	    ty = t1y;
	} else {
	    tx = t2x;
	    ty = t2y;
	}
	seekPosition(tx,ty,ship,session,input);
    }
    
}



function seekPosition(x,y,ship,session,input) {

	var x0 = ship.box.x;
	var y0 = ship.box.y;
	var dir = ship.box.dir;
	var nx = x - x0;
	var ny = y - y0;

	
	if (Math.abs(nx) + Math.abs(ny) < 1) {
	    input.anchor = true;
	    ship.orders.shift();

	} else {	    
	    if (Math.abs(x0 - ship.prevX) < 1 &&
		Math.abs(y0 - ship.prevY) < 1 ) {
		input.oars = true;
	    } else {
		input.sails = true;
	    }
	    var norm = nx*nx+ny*ny;
	    if (norm > 0.0001) {
		nx /= norm;
		ny /= norm;
		var cross = nx*Math.sin(ship.box.dir)
		    - ny*Math.cos(ship.box.dir);
		
		if (cross > 0.03) {
		    input.left = true;
		    
		} else if (cross < -0.03) {
		    input.right = true;

		} 
	    }
	}
}



module.exports = new AutoPilot();

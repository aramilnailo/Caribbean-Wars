var debug = require("./debug.js").autopilot;
var log = require("./debug.js").log;


//var easypilot = require("./autopilot/easypilot.js");


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

    if(debug) log("server/autopilot.js: order = "+JSON.stringify(order));

    if (! order) {
	if(debug) log("server/autopilot.js: ship="+ship.name+"; !order");
	return input;
    }
    
    if (order.name === "goto") {
	
	var x = order.coords.x;
	var y = order.coords.y;
	var x0 = ship.box.x;
	var y0 = ship.box.y;
	var dir = ship.box.dir;
	var nx = x - x0;
	var ny = y - y0;
	
	
	if (Math.abs(nx) + Math.abs(ny) < 0.1) {
	    input.anchor = true;
	    ship.orders.shift();
	    if (debug) log("server/autopilot.js: ship="+ship.name+"; anchored");
	} else {	    
	    if (Math.abs(x0 - ship.prevX) === 0 &&
		Math.abs(y0 - ship.prevY) === 0) {
		if (debug) log("server/autopilot.js: ship="+ship.name+"; oars");
		input.oars = true;
	    } else {
		if (debug) log("server/autopilot.js: ship="+ship.name+"; sails");
		input.sails = true;
	    }
	    var norm = nx*nx+ny*ny;
	    if (norm > 0.0001) {
		nx /= norm;
		ny /= norm;
		var cross = nx*Math.sin(ship.box.dir);
		    - ny*Math.cos(ship.box.dir);
		
		if (cross > 0.03) {
		    input.left = true;
		    if (debug) log("server/autopilot.js: ship="+ship.name+"; left; cross="+cross);
		    
		} else if (cross < -0.03) {
		    input.right = true;
		    if (debug) log("server/autopilot.js: ship="+ship.name+"; right; cross="+cross);
		} else {
		    if (debug) log("server/autopilot.js: ship="+ship.name+"; null; cross="+cross);
		}
	    }
	}
	
    }
    
    return input;
    
}


/*
function seekPosition(ship, session) {

    return easypilot.computeInput(ship, session);
    

    //if (ship.order.last) {
//	if input.order.last
  //  }
    //
    //var c = Math.cos(ship.box.dir);
    //var s = Math.sin(ship.box.dir);
    //
  //  var dot = c*wind.x + s*wind.y;
  //  if (dot < 0) dot = 0;


    // tangent formula for sails = false, ddir != 0 step
    // set dir for next sails = true
    // assume v = dy/dx known
    //tanth = { +/- v.wx +/- wy +/- sqrt[(v.wx+/- wy)^2 - 4(v.wy-v.by+bx)(bx-wx-v.by)] } / { 2 (v.wy - v.by + bx) }
   
    
    // assumed computed: sx,sy
    // to determine: c,s
    //var sx = -0.005*ship.box.dx + 0.01*dot*c - ship.box.dy*s;
    //var sy = -0.005*ship.box.dy + 0.01*dot*s + ship.box.dx*c;


}

*/


module.exports = new AutoPilot();

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
		  anchor:false,
		  swap:false
		};


    if (! ship.orders || ship.orders.length === 0) {
	ship.lastorder = input;
	return input;
    }
    if (debug) log("server/autopilot.js: orders.length = "+ship.orders.length);
    var order = ship.orders.pop();

    if(debug) log("server/autopilot.js: order = "+JSON.stringify(order));

    if (! order) {
	ship.lastorder = input;
	return input;
    }
    
    if (order.name === "goto") {
	if (debug) log("server/autopilot.js: processing goto");
	var x = order.coords.x;
	var y = order.coords.y;
	var x0 = ship.box.x;
	var y0 = ship.box.y;
	var dir = ship.box.dir;

	if (Math.abs(x0-x) + Math.abs(y0-y) < 0.01) {
	    input.anchor = true;
	} else {
	    input.sails = true;
	    var turn = true;
	    if (ship.lastorder &&
		ship.lastorder.left === false
		 && ship.lastorder.right === false) {
		var cross = (x-x0)*Math.sin(ship.box.dir)
	            - (y-y0)*Math.cos(ship.box.dir);
		if (cross > 0) input.left = true;
		else if (cross < 0) input.right = true;
	    }
	    
	}

    }
    
    ship.lastorder = input;

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

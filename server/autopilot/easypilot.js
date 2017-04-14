
var debug = require("../debug.js").autopilot;
var log = require("../debug.js").log;

var EasyPilot = function() {}

EasyPilot.prototype.computeInput = function(ship, session) {

    var input = { left:false,
		  right:false,
		  firingLeft:false,
		  firingRight:false,
		  sails:false,
		  anchor:false,
		  swap:false
		};

    var order = ship.order.pop();
    if (! order) return input;
    
    if (order.name === "goto") {
	if (debug) debug.log("server/autopilot/easypilot.js: processing goto");
	var x = order.target.x;
	var y = order.target.y;
	var x0 = ship.box.x;
	var y0 = ship.box.y;
	var dir = ship.box.dir;
    
	if (Math.abs(x0-x) + Math.abs(y0-y) < 0.01) {
	    input.anchor = true;
	} else {
	    input.sails = true;
	    var cross = (x-x0)*Math.sin(ship.box.dir)
		- (y-y0)*Math.cos(ship.box.dir);
	    if (cross > 0) input.left = true;
	    else if (cross < 0) input.right = true;
	}

    }
    
    return input;
}

module.exports = new EasyPilot();


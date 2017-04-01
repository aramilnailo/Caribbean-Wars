var debug = require("./debug.js").autopilot;
var log = require("./debug.js").log;


var AutoPilot = function () {}


// Decision making algorithm.
// Takes a ship object and a given game session
// and returns the proper input object.
AutoPilot.prototype.getInput = function(ship, session) {
	return {
		left:false,
		right:false,
		firingLeft:false,
		firingRight:false,
		sails:false,
		anchor:false,
		swap:false
	};
}

module.exports = new AutoPilot();
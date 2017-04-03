var debug = require("./debug.js").autopilot;
var log = require("./debug.js").log;


var AutoPilot = function () {}


// Decision making algorithm.
// Takes a ship object and a given game session
// and returns the proper input object.
AutoPilot.prototype.getInput = function(ship, session) {

    var input;
    seekPosition(input,50,50);
    return input;

}

function seekPosition(input, x, y) {

    var c = Math.cos(ship.box.dir);
    var s = Math.sin(ship.box.dir);
    
    var dot = c*wind.x + s*wind.y;
    if (dot < 0) dot = 0;

    // assumed computed: sx,sy
    // to determine: c,s
    var sx = -0.005*ship.box.dx + 0.01*dot*c - ship.box.dy*s;
    var sy = -0.005*ship.box.dy + 0.01*dot*s + ship.box.dx*c;

    input.left = false ; 
    input.right = false;
    input.firingLeft = false;
    input.firingRight = false;
    input.sails = false;
    input.anchor = false;
    input.swap = false;

}





module.exports = new AutoPilot();

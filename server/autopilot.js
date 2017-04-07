var debug = require("./debug.js").autopilot;
var log = require("./debug.js").log;


var easypilot = require("./autopilot/easypilot.js");


var AutoPilot = function () {
    //indicies required to properly
    //cycle through ship points
    this.pt = [3,2,4,0];
}

//winding number algorithm
// assumes convex ship box
AutoPilot.prototype.inside = function(ship,x,y) {

    var wnum = 0;
    var cross;
    var verts = ship.box.verts;
    var x0 = ship.box.x;
    var y0 = ship.box.y;
    var n;
    var ax = verts[pt[0]].x - x;
    var ay = verts[pt[0]].y - y;
    var bx = verts[pt[1]].x - x;
    var by = verts[pt[1]].y - y;
    var sign = ax*by < ay*bx ? true : false;
    ax = bx;
    ay = by;
    for (n = 0; n < 4; n++) {
	bx = verts[pt[n]].x - x;
	by = verts[pt[n]].y - y;
	if (ax*by > ay*bx && sign) return false;
	ax = bx;
	ay = by;
    }
    return true;

}



// Decision making algorithm.
// Takes a ship object and a given game session
// and returns the proper input object.
AutoPilot.prototype.getInput = function(ship, session) {


    /*
    var input = {
	left:false,
	right:false,
	firingLeft:false,
	firingRight:false,
	sails:false,
	anchor:false,
	swap:false
    };   
*/
    /*
    if (ship.order.name === "goto") {

	seekPosition(input,ship.order.x,ship.order.y);

    }
    ship.order.last = input;
    */

    return easypilot(ship,session);

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

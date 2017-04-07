var debug = require("./debug.js").autopilot;
var log = require("./debug.js").log;


var easypilot = require("./autopilot/easypilot.js");


var AutoPilot = function () {
    //indicies required to properly
    //cycle through ship points
    this.pt = [0,1,3,2,4,0];
}

//winding number algorithm
AutoPilot.prototype.inside = function(ship,x,y) {

    var wnum = 0;
    var cross;
    var verts = ship.box.verts;
    var x0 = ship.box.x;
    var y0 = ship.box.y;
    var n;
    var ax = verts[pt[0]].x - x;
    var ay = verts[pt[0]].y - y;
    var bx,by;
    var len;

    for (n = 1; n < 6; n++) {
	bx = verts[pt[n]].x - x;
	by = verts[pt[n]].y - y;
	if (ax*by > ay*bx) {
	    lenx += verts[pt[n]].x - verts[pt[n-1]].x;
	    leny += verts[pt[n]].y - verts[pt[n-1]].y;
	} else {
	    lenx -= verts[pt[n]].x - verts[pt[n-1]].x;
	    leny -= verts[pt[n]].y - verts[pt[n-1]].y;
	}
	ax = bx;
	ay = by;
    }

    return (lenx*lenx + leny*leny < 0.00001) ? true : false;

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

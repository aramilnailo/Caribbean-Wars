
define(["debug"], function(debug) {

    /**
     * Cannonball class constructor.
     *
     * @constructor
     */
    var CannonBall = function() {
	var cannonball = {
	    /** x,y coords */
	    x:0,
	    y:0,
	    /** x,y components of velocity */
	    vx:0,
	    vy:0
	};
	return cannonball;
    }

    return new CannonBall();
    
});

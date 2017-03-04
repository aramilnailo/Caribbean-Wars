
// ...will need to require crew.js
define(["debug", "dom", "client"], function(debug, dom, client) {

    /**
     *
     */
    var Ship = function() {
	
	var ship = {

	    /** @private */ this.name = "New ship";
	    /** @private */ this.captain = "?";
	    /** @private */ this.controlledBy = "autopilot";
	    /** @private */ this.x = "";
	    /** @private */ this.y = "";
	    /** @private */ this.vx = 0.0;
	    /** @private */ this.vy = 0.0;
	    
	    /** @private */ this.inPort = true;
	    /** @private */ this.sailsLevel = 0;

	    /** @private */
	    
	    /** 
	     * @private angle to indicate ship heading 
	     * with respect to map rotation
	     * [0 - 2pi), where 0 is North
	     */
	    this.dir = 0;

	    /** @private */ this.targetShip = null;
	    /** @private */ this.targetAction = "";
	    /** @private */ this.targetPort= null;
	    
	    this.crew = Crew();
	    this.resources = Resources();
	};

	
	return ship;
    };

    /**
     * Perform deep copy of ship s2
     */
    Ship.prototype.copy = function(Ship s2) {};
    
    /**
     *
     */
    Ship.prototype.move = function(x,y) {};
    
    
    /**
     *
     */
    Ship.prototype.targetForBoard = function(Ship s2) {};

    /**
     *
     */
    Ship.prototype.targetForBroadside = function(Ship s2) {};
    
    /**
     *
     */
    Ship.prototype.targetToFollow = function(Ship s2) {};
    
    /**
     *
     */
    Ship.prototype.targetForRam(Ship s2) {};
    
    /**
     *
     */
    Ship.prototype.targetForSwivel(Ship s) {};
    
    /**
     *
     */
    Ship.prototype.targetForPort(Port p) {};
    
    /**
     *
     */
    Ship.prototype.leavePort(Port p) {};

    /**
     *
     */
    Ship.prototype.fireStarboard();
    Ship.prototype.firePort();
    Ship.prototype.increaseSails();
    Ship.prototype.decreaseSails();
    

    
    
});





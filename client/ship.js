
// ...will need to require crew.js
define(["debug", "dom", "client"], function(debug, dom, client) {

    /**
     *
     */
    var Ship = function() {
	
	var ship = {

	    /** @private Ship name */ name:"HMS Anonymous",
	    /** @private Username */ captain:"?",
	    /** @private */ autopilot:false,
	    /** @private Ship position x-coord*/ x:"",
	    /** @private Ship position y-coord*/ y:"",
	    /** @private X-component of velocity */ vx:0.0,
	    /** @private Y-component of velocity */ vy:0.0,
	    /** @private */ inPort:true,
	    /** @private Range: [0,1] */ sailsLevel:0,

	    /** 
	     * @private Angle to indicate ship heading 
	     * with respect to map rotation
	     * [0 - 2pi), where 0 is North
	     */
	    dir:0,

	    /** @private Reference to any targetted ship*/ targetShip:null,
	    /** @private Flag */ targetAction:"",
	    /** @private */ targetPort:null,
	    
	    crew:Crew(),
	    rsc:Resources()
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





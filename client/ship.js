
// ...will need to require crew.js
define(["debug", "dom", "client"], function(debug, dom, client) {

    /**
     * Ship class constructor.
     *
     * @constructor
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
     *
     * @param ship2 The current ship and ship2 will share
     * identical values for all member fields. 
     */
    Ship.prototype.copy = function(ship2) {};
    
    /**
     * Move current ship to position (x,y) without rendering.
     *
     * @param x
     * @param y move() places the ship at position x,y
     *          where x,y are measured in units used by the current world map.
     * 
     */
    Ship.prototype.move = function(x,y) {};
    
    
    /**
     * Sets ship2 as a target to consider when
     * determining current ship update,
     * and target action to board ship2.
     *
     * @param ship2 Reference to target ship.
     */
    Ship.prototype.targetForBoard = function(ship2) {};

    /**
     * Sets ship2 as a target to consider when
     * determining current ship update,
     * and target action to broadside ship2.
     *
     * @param ship2 Reference to target ship.
     */
    Ship.prototype.targetForBroadside = function(ship2) {};
    
    /**
     * Sets ship2 as a target to consider when
     * determining current ship update,
     * and target action to follow ship2.
     *
     * @param ship2 Reference to target ship.
     * @param dx, dy Position relative to ship2
     */
    Ship.prototype.targetToFollow = function(ship2, dx, dy) {
    };
    
    /**
     * Sets ship2 as a target to consider when
     * determining current ship update,
     * and target action to ram ship2.
     *
     * @param ship2 Reference to target ship.
     */
    Ship.prototype.targetForRam(ship2) {};

    /**
     * Sets ship2 as a target to consider when
     * determining current ship update,
     * and target action to swivel around ship2.
     * 
     * @param ship2 Reference to target ship.
     */
    Ship.prototype.targetForSwivel(ship2) {};
    
    /**
     * Current ship will target docking 
     * at the specified port.
     *
     * @param port1 Reference to target port
     */
    Ship.prototype.targetForPort(port1) {};
    
    /**
     * Request by currently docked ship
     * to leave port.
     *
     * @return true if successful
     *         false otherwise
     *           
     */
    Ship.prototype.leavePort() {};

    /**
     * Fire cannons.
     * 
     * @param side "starboard" or "port"
     * @return false if no cannonballs available
     *         true otherwise
     */
    Ship.prototype.fireCannons(side);

    /**
     * Augments sailLevel (e.g. responsiveness to 
     * prevailing wind).
     *
     * @return false if sails are currently at max height
     *               or if sails are too damaged to adjust
     *         true otherwise
     */
    Ship.prototype.increaseSails();

    /**
     * Decrements sailLevel (e.g. responsiveness to 
     * prevailing wind).
     *
     * @return false if sails are currently at min height
     *               or if sails are too damaged to adjust
     *         true otherwise
     */
    Ship.prototype.decreaseSails();
    

    return new Ship();
    
});





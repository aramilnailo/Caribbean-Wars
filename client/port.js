

define(["debug", "dom", "client"], function(debug, dom, client) {

    /**
     * Port class constructor.
     *
     * @constructor
     */
    var Port = function() {
	var port = {
	    /** @public Name of this port */
	    name:"GhostTown",
	    /** @public Direction that dock faces the ocean [0,2pi) */
	    dir:0,
	    /** @pubic Maximum number of ships docked in this port */
	    maxDockedShips:100,
	    /** @public List of ships currently docked in this port */
	    shipsInDock:[],
	    // available resources?
	    // numdocks?
	    // user?
	};
	return port;
    }

    /**
     * Dock a ship in this port, if there is space.
     *
     * @param ship The ship to dock in this port
     */
    Port.prototype.dock = function(ship) {
	if (this.shipsInDock.length < this.maxDockedShips) {
	    shipsInDock.push(ship);
	    return true;
	} else return false;
    }

    /**
     * Remove a ship from this port, if it is docked here.
     *
     * @param ship The ship to undock
     */
    Port.prototype.leave = function (ship) {
	var index = shipsInDock.findIndex(function(s) {
	    return s === ship;
	});
	if (index === -1) return false;
	else {
	    shipsInDock.splice(index,1);
	    return true;
	} 
    };

    return new Port();
    
});



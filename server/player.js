

var dbi = require("./dbi.js");
var debug = require("./debug.js").player;
var log = require("./debug.js").log;

//========= PLAYER OBJECT ==================

/**
* Object containing all information about a
* single player's state.
* @module server/Player
*/
var Player = function(name) {
    /**
     * Player object
     * @memberof module:server/Player
     */
    var player = {
		box:{
			x:5, 
			y:5, 
			w:0.5, 
			h:0.5, 
			dir:0, 
			prev_x:0, 
			prev_y:0
		},
		pressingRight:false,
		pressingLeft:false,
		pressingUp:false,
		pressingDown:false,
		maxSpeed:0.25,
		diff:0,
		active:true,
		name:name
    }
	
    return player;
}

module.exports.Player = Player;

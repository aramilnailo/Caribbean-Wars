

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
			w:1, 
			h:1, 
			dir:0, 
			prev_x:0, 
			prev_y:0
		},
		pressingRight:false,
		pressingLeft:false,
		pressingUp:false,
		pressingDown:false,
		speedX:0,
		speedY:0,
		maxAccel:0.03,
		maxSpeed:0.15,
		diff:0,
		active:true,
		name:name
    }
	
    return player;
}

module.exports.Player = Player;

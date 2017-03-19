

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
		x:250,
		y:250,
		pressingRight:false,
		pressingLeft:false,
		pressingUp:false,
		pressingDown:false,
		maxSpeed:10,
		diff:0,
		active:true,
		name:name
    }
	
    return player;
}

module.exports.Player = Player;



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
    
	player.updatePosition = function() {
		if(!player.active) return;
		var oldX = player.x, oldY = player.y;
		if(player.pressingRight) player.x += player.maxSpeed;
		if(player.pressingLeft) player.x -= player.maxSpeed;
		if(player.pressingUp) player.y -= player.maxSpeed;
		if(player.pressingDown) player.y += player.maxSpeed;
		var diffX = player.x - oldX, diffY = player.y - oldY;
		player.diff += Math.sqrt(diffX * diffX + diffY * diffY);
	}
	
    return player;
}

module.exports.Player = Player;

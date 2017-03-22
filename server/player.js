
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
		},
		
		prevX:5,
		prevY:5,
		
		pressingRight:false,
		pressingLeft:false,
		pressingUp:false,
		pressingDown:false,
		
		firing:false,
		numCannons:10,
		projectiles:[],
		
		speedX:0,
		speedY:0,
		maxAccel:0.03,
		maxSpeed:0.15,
		
		diff:{
			distanceSailed:0,
			shotsFired:0
		},
		
		active:true,
		name:name
    }
	
    return player;
}

module.exports.Player = Player;

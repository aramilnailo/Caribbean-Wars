
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
			dx:0,
			dy:0,
			hit:false,
			stuck:false,
		},
		input:{
			right:false,
			left:false,
			up:false,
			down:false,
			firing:false,
			rotating:false
		},
		diff:{
			distanceSailed:0,
			shotsFired:0
		},
		maxAccel:0.03,
		maxSpeed:0.15,
		prevX:5,
		prevY:5,
		numCannons:10,
		projectiles:[],
		active:true,
		name:name
    }
	
    return player;
}

module.exports.Player = Player;

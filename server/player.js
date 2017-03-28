
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
			w:2, 
			h:1,
			dir:0,
			ddir:0,
			
			dx:0,
			dy:0,
			ddx:0,
			ddy:0,
			dx_max:0.30,
			dy_max:0.30,
			mass:1,
			
			hit:false,
			stuck:false,
			verts:[],
			forces:[],
			damage:[],
			name:name
		},
		input:{
			right:false,
			left:false,
			up:false,
			down:false,
			firing:false,
			sails:false
		},
		diff:{
			distanceSailed:0,
			shotsFired:0,
			shipsSunk:0,
			shipsLost:0
		},
		prevX:5,
		prevY:5,
		numCannons:50,
		reloadCount:0,
		reloadRate:1,
		firepower:0.25,
		projectiles:[],
		active:true,
		name:name,
		health:100,
		alive:true
    }
	
	var x1 = player.box.x - player.box.w / 2,
	x2 = player.box.x + player.box.w / 2,
	y1 = player.box.y - player.box.h / 2,
	y2 = player.box.y + player.box.h / 2;
	
	player.box.verts.push({ x:x1, y:y2 }); // bottom left
	player.box.verts.push({ x:x2, y:y2 }); // bottom right
	player.box.verts.push({ 
		x:player.box.x + player.box.w,		// point
		y:player.box.y});
	player.box.verts.push({ x:x2, y:y1 }); // top right
	player.box.verts.push({ x:x1, y:y1 }); // top left
	
    return player;
}

module.exports.Player = Player;

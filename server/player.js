//==== PLAYER OBJECT =======

var Player = function(name) {
	
	var player = {
		name:name,
		input:{
			left:false,
			right:false,
			firingLeft:false,
			firingRight:false,
			sails:false,
			anchor:false
		},
		diff:{
			distanceSailed:0,
			shotsFired:0,
			shipsSunk:0,
			shipsLost:0
		},
		ships:[],
		activeShip:null,
		out:false
	}
return player;

};

module.exports = Player;
//==== PLAYER OBJECT =======

var Player = function(name) {
	
	var player = {
		name:name,
		input:{
			left:false,
			right:false,
			firingLeft:false,
		        firingRight:false,
		        firingCount:0,
			sails:false,
			anchor:false,
		        oars:false,
         	        autocontrol:false
		},
		diff:{
			distanceSailed:0,
			shotsFired:0,
			shipsSunk:0,
			shipsLost:0
		},
		ships:[],
		out:false
	}
return player;

};

module.exports = Player;

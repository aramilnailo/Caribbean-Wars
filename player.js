var dbi = require("./dbi.js");
//========= PLAYER OBJECT ==================

var Player = function(username) {
    var player = {
	x:250,
	y:250,
	username:username,
	number:"" + Math.floor(10 * Math.random()),
	pressingRight:false,
	pressingLeft:false,
	pressingUp:false,
	pressingDown:false,
	maxSpeed:10
    }
    player.updatePosition = function() {
	if(player.pressingRight)
	    player.x += player.maxSpeed;
		dbi.updateStat(username, distanceSailed, 1, function(err){
			if (err){
				console.log("Could not update distance moved");
			}
		});
	if(player.pressingLeft)
	    player.x -= player.maxSpeed;
		dbi.updateStat(username, distanceSailed, 1, function(err){
			if (err){
				console.log("Could not update distance moved");
			}
		});
	if(player.pressingUp)
	    player.y -= player.maxSpeed;
		dbi.updateStat(username, distanceSailed, 1, function(err){
			if (err){
				console.log("Could not update distance moved");
			}
		});
	if(player.pressingDown)
	    player.y += player.maxSpeed;
		dbi.updateStat(username, distanceSailed, 1, function(err){
			if (err){
				console.log("Could not update distance moved");
			}
		});
    }
    return player;
}

module.exports.Player = Player;

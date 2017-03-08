

var dbi = require("./dbi.js");
var debug = require("./debug.js").player;
var log = require("./debug.js").log;

//========= PLAYER OBJECT ==================

/**
* Object containing all information about a
* single player's state.
*/
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
	var moved = false;
	if(player.pressingRight) {
	    moved = true;
	    player.x += player.maxSpeed;
	}
	if(player.pressingLeft) {
	    moved = true;
	    player.x -= player.maxSpeed;
	}
	if(player.pressingUp) {
	    moved = true;
	    player.y -= player.maxSpeed;
	}
	if(player.pressingDown) {
	    moved = true;
	    player.y += player.maxSpeed;
	}
	if(moved) {
	    dbi.updateStat(username, "distance_sailed", 0.1, function(err) {
		if(!err) {
		    log("Could not update distance sailed");
		}
	    });
	}
    }
    return player;
}

module.exports.Player = Player;

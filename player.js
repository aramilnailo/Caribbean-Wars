
var Player = function(id) {
    var player = {
	x:250,
	y:250,
	username:id,
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
	if(player.pressingLeft)
	    player.x -= player.maxSpeed;
	if(player.pressingUp)
	    player.y -= player.maxSpeed;
	if(player.pressingDown)
	    player.y += player.maxSpeed;
    }
    return player;
}

module.exports.Player = Player;

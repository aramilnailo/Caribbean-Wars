
var CLIENT_LIST = require("./accountmanager.js").CLIENT_LIST;
var GAME_SESSION = (require("./gamesessions.js")).GAME_SESSION;


//============== GAME LOGIC =========================================

var Game = function () {};

Game.prototype.listen = function(sox) {
    sox.listen("keyPress",this.keyPress);
}

// Recieved game input
Game.prototype.keyPress = function (param) {
    console.log("call to game.keyPress()");
    var client = param.client;
    var data = param.data;
	// If the client is in control of a player
	if(client.player !== null) {
	    // Assign booleans for each direction
	    if(data.inputId === "left")
		  client.player.pressingLeft = data.state;
	    else if(data.inputId === "right")
		  client.player.pressingRight = data.state;
	    else if(data.inputId === "up")
		  client.player.pressingUp = data.state;
	    else if(data.inputId === "down")
		  client.player.pressingDown = data.state;
	}
}

Game.prototype.run = function() {

    console.log("running...");
    // Main game op runs at 40 fps
    setInterval(function() {
	var pack = [], p, i, socket;
	// Generate object with all player positions
	for(i in GAME_SESSION.players) {
	    p = GAME_SESSION.players[i];
	    if(p !== null) {
		p.updatePosition();
		pack.push({x:p.x, y:p.y, number:p.number});
	    }
	}
	// Send the packet to each client
	for(i in CLIENT_LIST) {
	    socket = CLIENT_LIST[i].socket;
	    socket.emit("newPositions", pack);
	}
    }, 1000/40);
    
    //============== UPDATE STATS =======================================
    
    // Updates secondsPlayed database field
    setInterval(function() {
	var i, p;
	for(i in GAME_SESSION.players){
	    p = GAME_SESSION.players[i];
	    dbi.updateStat(p.username, "seconds_played", 1, function(err) {
		if(!err) {
		    console.log("Failed to update seconds played");
		}
	    });
	}
    }, 1000);

}

module.exports = new Game();

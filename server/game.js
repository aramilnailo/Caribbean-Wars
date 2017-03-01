
var debug = require("./debug.js").game;
var log = require("./debug.js").log;


var CLIENT_LIST = require("./router.js").client_list;
var GAME_SESSION = require("./session.js").GAME_SESSION;
var dbi = require("./dbi.js");


//============== GAME LOGIC =========================================

var Game = function () {};

Game.prototype.listen = function(router) {
    router.listen("keyPress",this.keyPress);
}

// Recieved game input
Game.prototype.keyPress = function (param) {
    if (debug) log("call to game.keyPress()");
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

Game.prototype.update = function() {
	var pack = [], p, i, socket;
	// Generate object with all player positions
	for(var i in GAME_SESSION.players) {
	    p = GAME_SESSION.players[i];
	    if(p !== null) {
		p.updatePosition();
		pack.push({x:p.x, y:p.y, number:p.number});
	    }
	}
	// Send the packet to each client
	for(var i in CLIENT_LIST) {
	    socket = CLIENT_LIST[i].socket;
	    socket.emit("newPositions", pack);
	}
}

// Updates secondsPlayed database field
Game.prototype.updateStats = function() {
	//var i, p;
	for(var i in GAME_SESSION.players){
	    var p = GAME_SESSION.players[i];
	    dbi.updateStat(p.username, "seconds_played", 1, function(err) {
		if(!err) {
		    if (debug) log("Failed to update seconds played");
		}
	    });
	}
}

module.exports = new Game();

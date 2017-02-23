
/*================= CONTENTS ================================
  1) Modules
  2) Server Initialization
  3) Socket listeners
  4) Login screen listeners
  5) Game screen listeners
  6) Game logic
  7) To do
  8) Stat Manipulation													*/

//=============== 1) MODULES ================================

var express = require("express");
var app = express();
var serv = require("http").Server(app);
var dbi = require("./dbi.js");
var files = require("./files.js");
var player = require('./player.js');
var io = require("socket.io")(serv, {});

//================= 2) SERVER INITIALIZATION =============================

// Track all current clients
var CLIENT_LIST = [];

// Track the current game session
var GAME_SESSION = {host:null, map:"", players:[]};

// Server startup
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
serv.listen(2000);
console.log("Server started");

// Connect to database
dbi.connect.call(this);

//=================== GAME SESSION ====================================

var endGameSession = function() {
    // Reset the object
    GAME_SESSION.host = null;
    GAME_SESSION.map = "";
    // Set everyone offline
    for(i in GAME_SESSION.players) {
	dbi.setUserOnlineStatus(GAME_SESSION.players[i].username, false);
    }
    // Null out the player list
    GAME_SESSION.players = [];
    // Log everyone out
    for(i in CLIENT_LIST) {
	CLIENT_LIST[i].player = null;
	CLIENT_LIST[i].socket.emit("logoutResponse");
	CLIENT_LIST[i].socket.emit("collapseMenus");
    }
}

var exitGameSession = function(data) {
    // Remove the player from the game session list
    index = GAME_SESSION.players.indexOf(data);
    if(index > -1) GAME_SESSION.players.splice(index, 1);
    // Turn the player offline in the database
    dbi.setUserOnlineStatus(data.username, false);
    // If the host leaves, it's game over for everyone
    if(data === GAME_SESSION.host) endGameSession();
}

var enterGameSession = function(data) {
    // If no one is online, the player becomes host
    if(GAME_SESSION.players.length == 0) {
	GAME_SESSION.host = data;
    }
    // Add player to game session list
    GAME_SESSION.players.push(data);
    // Turn the player online in the database
    dbi.setUserOnlineStatus(data.username, true);
}

//==================== 3) SOCKET LISTENERS =====================================

// When a client connects to the server
io.sockets.on("connection", function(socket) {

    // Create object for this client
    var client = {socket:socket, player:null};
    // Add it to client list
    CLIENT_LIST.push(client);
    
    // Client closed the window, network issue, etc.
    socket.on("disconnect", function() {
	// If in a game, remove the player
	if(client.player !== null) {
	    exitGameSession(client.player);
	}
	socket.emit("collapseMenus");
	// Remove from client list
	var index = CLIENT_LIST.indexOf(client);
	if(index > -1) CLIENT_LIST.splice(index, 1);
    });
    
    //===================== 4) LOGIN SCREEN LISTENERS ==============================

    // Client clicked login button
    socket.on("login", function(data) {
	// Check info with the database
	dbi.login(data.username, data.password, function(resp) {
	    if(resp) {
		// If login info is valid, give the client a player
		client.player = player.Player(data.username);
		// The player joins the game
		enterGameSession(client.player);
		socket.emit("loginResponse", {success:true,
					      username:data.username});
		socket.emit("collapseMenus");
	    } else {
		// If login info is denied
		socket.emit("loginResponse", {success:false});
	    }
	});
    });

    socket.on("signup", function(data) {
	// Create new record in database
	dbi.signup(data.username, data.password, function(resp) {
	    if(resp) {
		// If info is valid, give the client a player
		client.player = player.Player(data.username);
		enterGameSession(client.player);
		dbi.addUserStats(client.player.username, function(resp) {});
		socket.emit("loginResponse", {success:true,
					      username:data.username});
		socket.emit("collapseMenus");
	    } else {
		// If duplicate username, etc.
		socket.emit("loginResponse", {success:false});
	    }
	});
    });
    
    // Client clicked list users
    socket.on("userListRequest", function() {
	// Send back the whole table from the database
	dbi.getAllUserInfo(function(data) {
	    socket.emit("userListResponse", data);
	});
    });

    //===================== 5) GAME SCREEN LISTENERS =========================

    // Clicked logout
    socket.on("logout", function() {
	// Remove from the game session, but don't remove the client
	if(client.player) {
	    exitGameSession(client.player);
	    client.player = null;
	}
	socket.emit("logoutResponse");
	socket.emit("collapseMenus");
    });

    // Clicked delete account
    socket.on("deleteAccount", function() {
	if(client.player) {
	    dbi.removeUserStats(client.player.username, function(val) {});
	    dbi.removeUser(client.player.username, function(resp) {
		if(!resp) {
		    console.log("Could not delete account.");
		}
	    });
	    exitGameSession(client.player);
	    client.player = null;
	}
	socket.emit("logoutResponse");
	socket.emit("collapseMenus");
    });

    // Clicked delete saved game
    socket.on("deleteSavedGame", function(data) {
	dbi.removeSavedGame({file_name:data,
			     author:client.player.username},
			    function(resp) {
				socket.emit("deleteSavedGameResponse", resp);
			    });
    });
    
    // Recieved game input
    socket.on("keyPress", function(data) {
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
    });

    //================ CHAT LISTENERS ==============================
    
    // Recieved a chat post
    socket.on("chatPost", function(data) {
	// Notify all clients to add post
	if(client.player !== null) {
	    for(var i in CLIENT_LIST) {
		CLIENT_LIST[i].socket.emit("addToChat",
					   client.player.username +
					   ": " + data);
	    }
	}
    });

    socket.on("privateMessage", function(data) {
	// Notify the target client to add the post
	if(client.player !== null) {
	    var current;
	    for(var i in CLIENT_LIST) {
		current = CLIENT_LIST[i];
		if(current.player !== null &&
		   current.player.username == data.user) {
		    current.socket.emit("addToChat", "From " +
					client.player.username +
					": " + data.message);
		    client.socket.emit("addToChat", "To " +
				       current.player.username +
				       ": " + data.message);
		}
	    }
	}
    });
    
    // Debug command sent through chat
    socket.on("evalExpression", function(data) {
	var resp;
	try {
	    resp = eval(data);
	} catch (error) {
	    console.log("Error: " + error.message);
	    client.socket.emit("addToChat", "Command Syntax Error." )
	}
	socket.emit("evalResponse", resp);
    });

    //================== 7) TO DO =======================================

    socket.on("saveGameRequest", function(data) {
	dbi.saveGameFilename(data, function(resp) {
	    socket.emit("saveGameResponse", resp);
	});
    });
    
    socket.on("savedGamesListRequest", function() {
	dbi.getSavedGamesList(function(data) {
	    socket.emit("savedGamesListResponse", data);
	});
    });

    socket.on("getMap", function() {
	if(GAME_SESSION.map === "") GAME_SESSION.map = "./assets/map";
	files.readFile(GAME_SESSION.map, function(data) {
	    if(data) {
		socket.emit("mapData", {data:data, path:GAME_SESSION.map});
	    } else {
		socket.emit("mapDataFailed");
	    }
	});
    });

    socket.on("loadNewMap", function(filename) {
	var i;
	dbi.getMapFilePath(filename, function(path) {
	    if(path) {
		files.readFile(path, function(data) {
		    if(data) {
			GAME_SESSION.map = path;
			for(i in CLIENT_LIST) {
			    CLIENT_LIST[i].socket.emit("mapData",
						       {data:data, path:path});
			}
		    }
		});
	    } else {
		socket.emit("mapDataFailed");
	    }
	});
    });

    socket.on("statsMenuRequest", function() {
	dbi.getAllStats(function(data) {
	    if(data) {
		socket.emit("statsMenuResponse", data);
	    }
	});
    });

    socket.on("isHost", function(cb) {
	cb(GAME_SESSION.host !== null &&
	   GAME_SESSION.host === client.player);
    });
});

//============== 6) GAME LOGIC ================================================

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

//============== 8) STAT MANIPULATION 	=======================================

// Updates minutesPlayed database field
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

// Insert more Stat manipulation functions when trackable stats are added.

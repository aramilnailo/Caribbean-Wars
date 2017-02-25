
//=============== 1) MODULES ================================

var express = require("express");
var app = express();
var serv = require("http").Server(app);
var dbi = require("./dbi.js");
var files = require("./files.js");
var player = require('./player.js');
var io = require("socket.io")(serv, {});
sox.initialize(io.sockets);

//================= SERVER INITIALIZATION =============================

// Server variables
//var CLIENT_LIST = [];
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

function endGameSession() {
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

function exitGameSession(data) {
    // Remove the player from the game session list
    index = GAME_SESSION.players.indexOf(data);
    if(index > -1) GAME_SESSION.players.splice(index, 1);
    // Turn the player offline in the database
    dbi.setUserOnlineStatus(data.username, false);
    // If the host leaves, it's game over for everyone
    if(data === GAME_SESSION.host) endGameSession();
}

function enterGameSession(data) {
    // If no one is online, the player becomes host
    if(GAME_SESSION.players.length == 0) {
	GAME_SESSION.host = data;
    }
    // Add player to game session list
    GAME_SESSION.players.push(data);
    // Turn the player online in the database
    dbi.setUserOnlineStatus(data.username, true);
}


//========================= CLIENT INTERFACE =========================

// When a client connects to the server
io.sockets.on("connection", function(socket) {
    // Create object for this client
    var client = {socket:socket, player:null};
    // Add it to client list
    CLIENT_LIST.push(client);
    
    // Call the appropriate function
    socket.on("message", function(message) {
        console.log("Recieved " + message.name);
        console.log("About to call " + message.name + "(" + client + ", " + 
                    message.data + ")");
        var data = {client:client, call:message.name, pass:message.data};
        callFunction(data);
    });
});

var functions = [ 
     {name:"disconnect",           ref:disconnect},
     {name:"login",                ref:login},
     {name:"signup",               ref:signup},
     {name:"userListRequest",      ref:userListRequest},
     {name:"logout",               ref:logout},
     {name:"deleteAccount",        ref:deleteAccount},
     {name:"deleteSavedGame",      ref:deleteSavedGame},
     {name:"keyPress",             ref:keyPress},
     {name:"chatPost",             ref:chatPost},
     {name:"privateMessage",       ref:privateMessage},
     {name:"evalExpression",       ref:evalExpression},
     {name:"savedGamesListRequest",ref:savedGamesListRequest},
     {name:"saveGameRequest",      ref:saveGameRequest},
     {name:"getMap",               ref:getMap},
     {name:"loadNewMap",           ref:loadNewMap},
     {name:"statsMenuRequest",     ref:statsMenuRequest}
    ];
              

// Call the function paired with the event "name"
function callFunction(data) {
    var param = {client:data.client, data:data.pass}, i;
    for(i in functions) {
        if(functions[i].name == data.call) {
            console.log("Called " + data.call + "(" + data.client + ", " + data.pass + ")");
            functions[i].ref.call(this, param);
        }
    }
}


    
//================== FUNCTIONS ========================================
    
    
// Client closed the window, network issue, etc.
function disconnect(param) {
    var client = param.client;
   // If in a game, remove the player
    if(client.player !== null) {
        exitGameSession(client.player);
    }
    client.socket.emit("collapseMenus");
    // Remove from client list
    var index = CLIENT_LIST.indexOf(client);
    if(index > -1) CLIENT_LIST.splice(index, 1);
}
    
// Client clicked login button
function login(param) {
    var client = param.client;
    var data = param.data;
    // Check info with the database
    dbi.login(data.username, data.password, function(resp) {
        if(resp) {
            // If login info is valid, give the client a player
            client.player = player.Player(data.username);
            // The player joins the game
            enterGameSession(client.player);
            client.socket.emit("loginResponse", {success:true,
                              username:data.username});
            client.socket.emit("collapseMenus");
        } else {
            // If login info is denied
            client.socket.emit("loginResponse", {success:false});
        }
    });
}

function signup(param) {
    var client = param.client;
    var data = param.data;
    // Create new record in database
    dbi.signup(data.username, data.password, function(resp) {
        if(resp) {
            // If info is valid, give the client a player
            client.player = player.Player(data.username);
            enterGameSession(client.player);
            dbi.addUserStats(client.player.username, function(resp) {});
            client.socket.emit("loginResponse", {success:true,
                              username:data.username});
            client.socket.emit("collapseMenus");
        } else {
            // If duplicate username, etc.
            client.socket.emit("loginResponse", {success:false});
        }
    });
}
    
function userListRequest(param) {
    var client = param.client;
	// Send back the whole table from the database
	dbi.getAllUserInfo(function(data) {
	    client.socket.emit("userListResponse", data);
	});
}

// Clicked logout
function logout(param) {
    var client = param.client;
	// Remove from the game session, but don't remove the client
	if(client.player) {
	    exitGameSession(client.player);
	    client.player = null;
	}
	client.socket.emit("logoutResponse");
	client.socket.emit("collapseMenus");
}

    // Clicked delete account
function deleteAccount(param) {
    var client = param.client;
	if(client.player) {
	    dbi.removeUserStats(client.player.username, function(val) {});
	    dbi.removeUser(client.player.username, function(resp) {
            
	    });
	    exitGameSession(client.player);
	    client.player = null;
	}
	client.socket.emit("logoutResponse");
	client.socket.emit("collapseMenus");
}

    // Clicked delete saved game
function deleteSavedGame(param) {
    var client = param.client;
    var data = param.data;
	dbi.removeSavedGame({file_name:data, author:client.player.username}, function(resp) {
        var msg = resp ? "Deleted \"" + data + "\"." : 
                    "Could not delete \"" + data + "\".";
        client.socket.emit("alert", msg);
    });
}
    
// Recieved game input
function keyPress(param) {
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

    // Recieved a chat post
function chatPost(param) {
    var client = param.client;
    var data = param.data;
	// Notify all clients to add post
	if(client.player !== null) {
	    for(var i in CLIENT_LIST) {
		  CLIENT_LIST[i].socket.emit("addToChat",
                                     client.player.username +
                                     ": " + data);
	    }
	}
}

function privateMessage(param) {
    var client = param.client;
    var data = param.data;
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
}
    
    // Debug command sent through chat
function evalExpression(param) {
    var client = param.client;
    var data = param.data;
	var resp = "";
	try {
	    resp = eval(data);
	} catch (error) {
	    console.log("Error: " + error.message);
	    client.socket.emit("addToChat", "Command Syntax Error." )
	}
	client.socket.emit("evalResponse", resp);
}

function saveGameRequest(param) {
    var client = param.client;
    var data = param.data;
	dbi.saveGameFilename(data, function(resp) {
        var msg = resp ? "Saved \"" + data.file_name + "\"." :
                        "Could not save \"" + data.file_name + "\".";
	       client.socket.emit("alert", msg);
    });
}
    
function savedGamesListRequest(param) {
    var client = param.client;
    var data = param.data;
	dbi.getSavedGamesList(function(data) {
	    client.socket.emit("savedGamesListResponse", data);
	});
}

function getMap(param) {
    var client = param.client;
    var data = param.data;
	if(GAME_SESSION.map === "") GAME_SESSION.map = "./assets/map";
	files.readFile(GAME_SESSION.map, function(data) {
	    if(data) {
		  client.socket.emit("mapData", {data:data, path:GAME_SESSION.map});
	    } else {
		  client.socket.emit("alert", "Could not read from map file");
	    }
	});
}

function loadNewMap(param) {
    var client = param.client;
    var filename = param.data.filename;
    var username = param.data.username;
    if(!GAME_SESSION.host || username != GAME_SESSION.host.username) {
        client.socket.emit("alert", "Only host can load maps.");
    } else {
	var i;
	dbi.getMapFilePath(filename, function(path) {
	    if(path) {
            files.readFile(path, function(data) {
                if(data) {
                    GAME_SESSION.map = path;
                    for(i in CLIENT_LIST) {
                        CLIENT_LIST[i].socket.emit("mapData", {data:data, path:path});
                    }
                }
            });
	    } else {
            client.socket.emit("alert", "Could not read from map file.");
	    }
	});
    }
}

function statsMenuRequest(param) {
    var client = param.client;
	dbi.getAllStats(function(data) {
	    if(data) {
		  client.socket.emit("statsMenuResponse", data);
	    }
	});
}



//============== GAME LOGIC =========================================

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

// Insert more Stat manipulation functions when trackable stats are added.

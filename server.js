
// ============== MODULES ============================

var express = require("express");
var app = express();
var serv = require("http").Server(app);
var dbi = require("./dbi.js");
var player = require('./player.js');
var io = require("socket.io")(serv, {});

//================= INIT =============================

//Track current clients
var SOCKET_LIST = [];
var PLAYER_LIST = [];

//Server startup
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
serv.listen(2000);
console.log("Server started");

//Connect to database
dbi.connect.call(this);

io.sockets.on("connection", function(socket) {
    //Add attribute 'id' as index for client list
    socket.id = Math.random();
    //Add connection to client list
    SOCKET_LIST[socket.id] = socket;

    var currentPlayer = {};

    //================== LISTENERS =================================

    // Clicked login button on login screen
    socket.on("login", function(data) {
	//Check info with the database
	dbi.login(data.username, data.password, function(resp) {
	    if(resp) {
		//If login info is valid, add new player
		currentPlayer = player.Player(data.username);
		PLAYER_LIST[socket.id] = currentPlayer;
		socket.emit("loginResponse", {success:true,
					      username:data.username});
	    } else {
		//If login info is denied
		socket.emit("loginResponse", {success:false});
	    }
	});
    });

    socket.on("saveGameRequest", function(data) {
	dbi.saveGameFilename(data, function(resp) {
	    if (resp) {
		socket.emit("saveGameResponse", {success:true,
						 filename:filename});
	    } else {
		socket.emit("saveGameResponse", {success:false});
	    }
	});
    }

    // Clicked signup button on login screen
    socket.on("signup", function(data) {
	//Create new record in database
	dbi.signup(data.username, data.password, function(resp) {
	    if(resp) {
		//If info is valid, add new player
		currentPlayer = player.Player(data.username);
		PLAYER_LIST[socket.id] = currentPlayer;
		socket.emit("loginResponse", {success:true,
					      username:data.username});
	    } else {
		//If duplicate username, etc.
		socket.emit("loginResponse", {success:false});
	    }
	});
    });

    //Clicked logout on the game screen
    socket.on("logout", function() {
	//Remove from player list but not socket list
	delete PLAYER_LIST[socket.id];
	socket.emit("logoutResponse");
    });
    
    //Closed the window, etc.
    socket.on("disconnect", function() {
	//Remove player and socket
	delete SOCKET_LIST[socket.id];
	delete PLAYER_LIST[socket.id];
    });

    //Chat post
    socket.on("sendMsgToServer", function(data) {
	var playerName = ("" + socket.id).slice(2, 7);
	//Notify all clients to add post
	for(var i in SOCKET_LIST) {
	    SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
	}
    });

    //Debug command sent through chat
    socket.on("evalServer", function(data) {
	var res = eval(data);
	socket.emit("evalAnswer", res);
    });

    //Game input
    socket.on("keyPress", function(data) {
	//Assign booleans for each direction
	if(data.inputId === "left")
	    currentPlayer.pressingLeft = data.state;
	else if(data.inputId === "right")
	    currentPlayer.pressingRight = data.state;
	else if(data.inputId === "up")
	    currentPlayer.pressingUp = data.state;
	else if(data.inputId === "down")
	    currentPlayer.pressingDown = data.state;
    });

    //Clicked list users on login screen
    socket.on("userListRequest", function() {
	//Send back the whole table from the database
	dbi.getAllUserInfo(function(data) {
	    socket.emit("userListResponse", data);
	});
    });

    socket.on("savedGamesListRequest", function() {
	dbi.getSavedGamesList(function(data) {
	    socket.emit("savedGameListResponse",data);
	});
    });
});

//============== GAME LOGIC ==================================

//Main game loop runs at 40 fps
setInterval(function() {
    var pack = [];
    //Generate object with all player positions
    for(var i in PLAYER_LIST) {
	var player = PLAYER_LIST[i];
	player.updatePosition();
	pack.push({
	    x:player.x,
	    y:player.y,
	    number:player.number
	});
    }
    //Send the packet to each client
    for(var i in SOCKET_LIST) {
	var socket = SOCKET_LIST[i];
	socket.emit("newPositions", pack);
    }
}, 1000/25);

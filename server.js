var DEBUG = true;

var express = require("express");
var app = express();
var serv = require("http").Server(app);
var dbi = require("./dbi.js");

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

dbi.connect.call(this);

serv.listen(2000);
console.log("Server started");

var SOCKET_LIST = [];
var PLAYER_LIST = [];

var players = require('./player.js');

var io = require("socket.io")(serv, {});

io.sockets.on("connection", function(socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    var player = {};

    socket.on("login", function(data) {
	dbi.login(data.username, data.password, function(resp) {
	    if(resp) {
		player = players.Player(data.username);
		PLAYER_LIST[socket.id] = player;
		socket.emit("loginResponse", {success:true,
					      username:data.username});
	    } else {
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
    
    socket.on("signup", function(data) {
	dbi.signup(data.username, data.password, function(resp) {
	    if(resp) {
		player = players.Player(data.username);
		PLAYER_LIST[socket.id] = player;
		socket.emit("loginResponse", {success:true,
					      username:data.username});
	    } else {
		socket.emit("loginResponse", {success:false});
	    }
	});
    });

    socket.on("logout", function() {
	delete PLAYER_LIST[socket.id];
	socket.emit("logoutResponse");
    });
    
    socket.on("disconnect", function() {
	delete SOCKET_LIST[socket.id];
	delete PLAYER_LIST[socket.id];
    });
    
    socket.on("sendMsgToServer", function(data) {
	var playerName = ("" + socket.id).slice(2, 7);
	for(var i in SOCKET_LIST) {
	    SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
	}
    });
    
    socket.on("evalServer", function(data) {
	if(DEBUG) {
	    var res = eval(data);
	    socket.emit("evalAnswer", res);
	}
    });
    
    socket.on("keyPress", function(data) {
	if(data.inputId === "left")
	    player.pressingLeft = data.state;
	else if(data.inputId === "right")
	    player.pressingRight = data.state;
	else if(data.inputId === "up")
	    player.pressingUp = data.state;
	else if(data.inputId === "down")
	    player.pressingDown = data.state;
    });

    socket.on("userListRequest", function() {
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

setInterval(function() {
    var pack = [];
    for(var i in PLAYER_LIST) {
	var player = PLAYER_LIST[i];
	player.updatePosition();
	pack.push({
	    x:player.x,
	    y:player.y,
	    number:player.number
	});
    }
    for(var i in SOCKET_LIST) {
	var socket = SOCKET_LIST[i];
	socket.emit("newPositions", pack);
    }
}, 1000/25);

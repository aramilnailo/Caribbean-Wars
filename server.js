var DEBUG = true;

var mysql = require("mysql");
var express = require("express");
var app = express();
var serv = require("http").Server(app);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(2000);
console.log("Server started");

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function(id) {
    var player = {
	x:250,
	y:250,
	id:id,
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

var db = mysql.createConnection({
    host:"mysql.cs.iastate.edu",
    user:"dbu309sr5",
    password:"NWI5ZTY0MzQw",
    database:"db309sr5"
});

db.connect(function(err) {
    if(err) {
	console.log(err.stack);
    } else {
	console.log("Connected to database.");
    }	   
});

var io = require("socket.io")(serv, {});

var login = function(username, password, cb) {
    db.query("SELECT * FROM user_info", function(err, rows) {
	if(err) {
	    console.log(err.stack);
	    cb(false);
	}
	var i;
	for(i = 0; i < rows.length; i++) {
	    console.log(rows[i].username + " : " +
			rows[i].password);
	    if(rows[i].username == username &&
	       rows[i].password == password) {
		cb(true);
	    }
	}
	cb(false);
    });
}

var signup = function(username, password, cb) {
    db.query("INSERT INTO user_info SET ?;",
        {username:username, password:password},
	function(err) {
	    if(err) {
		console.log(err.message);
		cb(false);
	    } else {
		cb(true);
	    }
	});
}

io.sockets.on("connection", function(socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    var player = {};

    socket.on("login", function(data) {
	login(data.username, data.password, function(data) {
	    if(data) {
		player = Player(socket.id);
		PLAYER_LIST[socket.id] = player;
		socket.emit("loginResponse", {success:true});
	    } else {
		socket.emit("loginResponse", {success:false});
	    }
	});
    });

    socket.on("signup", function(data) {
	signup(data.username, data.password, function(data) {
	    if(data) {
		player = Player(socket.id);
		PLAYER_LIST[socket.id] = player;
		socket.emit("loginResponse", {success:true});
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

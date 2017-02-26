
var debug = require("./debug.js").server;
var log = require("./debug.js").log;

//=============== 1) MODULES ================================

var express = require("express");
var app = express();
var serv = require("http").Server(app);
var io = require("socket.io")(serv, {});
var sox = require("./sox.js");

//================= SERVER INITIALIZATION =============================

// Server variables
//var CLIENT_LIST = [];
//var GAME_SESSION = {host:null, map:"", players:[]};

// Server startup
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
serv.listen(2000);
if (debug) log("Server started");


var dbi = require("./dbi.js");
var files = require("./files.js");
var player = require('./player.js');
var gamesessions = require("./gamesessions.js");
gamesessions.listen(sox);
var maps = require("./maps.js");
maps.listen(sox);
var stats = require("./stats.js");
stats.listen(sox);
var accountmanager = require("./accountmanager.js");
accountmanager.listen(sox);

var game = require("./game.js");
game.listen(sox);

// Connect to database
dbi.connect.call(this);

io.sockets.on("connection", function(socket) {
    socket.on("message", function(message) {
	if (debug) log("server.js: Routing " + message.name);
	var param = {socket:socket, name:message.name, data:message.data};
	sox.route(param);
    });
});
	     

game.run();



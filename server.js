
//=============== 1) MODULES ================================

var express = require("express");
var app = express();
var serv = require("http").Server(app);
var io = require("socket.io")(serv, {});
var sox = require("./sox.js");
//sox.initialize(io.sockets);



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
console.log("Server started");


var dbi = require("./dbi.js");
var files = require("./files.js");
var player = require('./player.js');
var gamesessions = require("./gamesessions.js");
var maps = require("./maps.js");
var stats = require("./stats.js");
var accountmanager = require("./accountmanager.js");
accountmanager.listen(sox);

var game = require("./game.js");

// Connect to database
dbi.connect.call(this);

io.sockets.on("connection", function(socket) {
    socket.on("message", function(message) {
	console.log("server.js: Routing " + message.name);
	var data = {socket:socket, name:message.name, pass:message.data};
	sox.route(data);
    });
});
	     

game.run();



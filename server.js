
var debug = require("./debug.js").server;
var log = require("./debug.js").log;

//=============== 1) MODULES ================================

var express = require("express");
var app = express();
var serv = require("http").Server(app);
var io = require("socket.io")(serv, {});

var router = require("./router.js");
var dbi = require("./dbi.js");
var files = require("./files.js");
var player = require('./player.js');
var session = require("./session.js");
var maps = require("./maps.js");
var stats = require("./stats.js");
var accounts = require("./accounts.js");
var game = require("./game.js");
var chat = require("./chat.js");
var saves = require("./saves.js");

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

// Connect to database
dbi.connect.call(this);

session.listen(router);
maps.listen(router);
stats.listen(router);
accounts.listen(router);
game.listen(router);
chat.listen(router);
saves.listen(router);

io.sockets.on("connection", function(socket) {
    socket.on("message", function(message) {
	if (debug) log("server.js: Routing " + message.name);
	var param = {socket:socket, name:message.name, data:message.data};
	router.route(param);
    });
});
	     

game.run();




var debug = require("./debug.js").server;
var log = require("./debug.js").log;

//=============== MODULES ================================

var router = require("./router.js");
var dbi = require("./dbi.js");

//========================================================

var Server = function() {}

Server.prototype.emit = function(socket, message, data) {
	socket.emit("message", {name:message, data:data});
}

// Server initialization
Server.prototype.init = function() {
	// Connect to database
	dbi.connect();
}

Server.prototype.run = function(io) {
	// Begin handling connections
	io.sockets.on("connection", function(socket) {
	    socket.on("message", function(message) {
			if (debug) log("server.js: Routing " + message.name);
			var param = {socket:socket, name:message.name, data:message.data};
			router.route(param);
	    });
	});
}

module.exports = new Server();

var debug = require("./debug.js").server;
var log = require("./debug.js").log;

//=============== MODULES ================================

var router = require("./router.js");
var dbi = require("./dbi.js");

//========================================================

/**
* The server namespace contains the functions for starting
* and running the server, as well as the wrapper function
* for client communication.
* @module server/Server
*/
var Server = function() {}

/**
* Wrapper function for client communication.
* @param socket - the socket that will emit the data
* @param message - the message name as a string
* @param data - the data to go with the message
* @memberof module:server/Server
*/
Server.prototype.emit = function(socket, message, data) {
	socket.emit("message", {name:message, data:data});
}

/**
* Performs startup operations for the server.
* @memberof module:server/Server
*/
Server.prototype.init = function() {
	// Connect to database
	dbi.connect();
}

/**
* Runs the server, and handles client communications.
* @param io - the socket.io object that handles signals
* @memberof module:server/Server
*/
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
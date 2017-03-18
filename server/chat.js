
var debug = require("./debug.js").chat;
var log = require("./debug.js").log;

var server = require("./server.js");

/**
* The chat namespace contains functions for parsing
* chat bar input from the clients and emitting the
* appropriate responses.
* @module server/Chat
*/
var Chat = function() {};

/**
* Registers the functions in this namespace with the
* given message router.
* @param router - the message router
* @memberof module:server/Chat
*/
Chat.prototype.listen = function(router) {
	if(debug) log("[Chat] listen()");
    router.listen("chatPost",this.chatPost);
    router.listen("privateMessage",this.privateMessage);
    router.listen("evalExpression",this.evalExpression);
}

/**
* Emits a public chat post to all clients.
* @param param - data passed by the router
* @param param.client - the client who submitted the post
* @param param.data - string containing the chat post
* @param param.clients - the client list
* @memberof module:server/Chat
*/
Chat.prototype.chatPost = function(param) {
    var client = param.client;
    var data = param.data;
	// Notify all clients to add post
    for(var i in param.clients) {
	  server.emit(param.clients[i].socket, "addToChat",
		client.username + ": " + data);
    }
}
/**
* Emits a private message to a specified user.
* @param param - data passed by the router
* @param param.client - the client sending the message
* @param param.data.user - the recipient of the message
* @param param.data.message - the private message
* @param param.clients - the client list
* @memberof module:server/Chat
*/
Chat.prototype.privateMessage = function(param) {
    var client = param.client;
    var data = param.data;
	// Notify the target client to add the post
	for(var i in param.clients) {
		var current = param.clients[i];
		if(current.username === data.user) {
        	server.emit(current.socket, "addToChat", "From " + 
			client.username + ": " + data.message);
			server.emit(client.socket, "addToChat", "To " +
            current.username + ": " + data.message);
	    }
	}
}
    
/**
* Evaluates an expression sent through chat, and either 
* emits the response to log to the client's console, or 
* sends an error message.
* @param param - data passed by the router
* @param param.client - the client submitting the command
* @param param.data - the expression
* @memberof module:server/Chat
*/
Chat.prototype.evalExpression = function(param) {
    var client = param.client;
    var data = param.data;
	var resp = "";
	try {
	    resp = eval(data);
	} catch (error) {
	    log("Error: " + error.message);
	    server.emit(client.socket, "addToChat", "Command Syntax Error." )
	}
	server.emit(client.socket, "evalResponse", resp);
}

module.exports = new Chat();

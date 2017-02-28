
var debug = require("./debug.js").chat;
var log = require("./debug.js").log;

var Chat = function() {};
              
Chat.prototype.listen = function(router) {
    router.listen("chatPost",this.chatPost);
    router.listen("privateMessage",this.privateMessage);
    router.listen("evalExpression",this.evalExpression);
}

    // Recieved a chat post
Chat.prototype.chatPost = function(param) {
    var client = param.client;
    var CLIENT_LIST = param.clients;
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

Chat.prototype.privateMessage = function(param) {
    var client = param.client;
    var CLIENT_LIST = param.clients;
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
Chat.prototype.evalExpression = function(param) {
    var client = param.client;
    var data = param.data;
	var resp = "";
	try {
	    resp = eval(data);
	} catch (error) {
	    log("Error: " + error.message);
	    client.socket.emit("addToChat", "Command Syntax Error." )
	}
	client.socket.emit("evalResponse", resp);
}

module.exports = new Chat();

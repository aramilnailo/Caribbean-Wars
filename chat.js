
var Chat = function() {};
              
Chat.prototype.listen = function(sox) {
    sox.listen("chatPost",this.chatPost);
    sox.listen("privateMessage",this.privateMessage);
    sox.listen("evalExpression",this.evalExpression);
}

    // Recieved a chat post
Chat.prototype.chatPost = function(param) {
    var client = param.client;
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
	    console.log("Error: " + error.message);
	    client.socket.emit("addToChat", "Command Syntax Error." )
	}
	client.socket.emit("evalResponse", resp);
}

module.exports = new Chat();
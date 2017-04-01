/**
* Client class. Holds game data and user data.
* 
* @module client/Client
*/
define(["debug", "dom", "router"], function(debug, dom, router) {

var Client = function() {};

Client.prototype.username = "";
Client.prototype.usertype = "";
Client.prototype.socket = null;

Client.prototype.camera = {x:0, y:0, zoom:1.0};
Client.prototype.input = {
	left:false,
	right:false,
	firingLeft:false,
	firingRight:false,
	sails:false,
	anchor:false,
	swap:false
};
Client.prototype.loading = false;
Client.prototype.drawing = false;
Client.prototype.inGame = false;

Client.prototype.gameState = null;
Client.prototype.map = null;

/**
* Wrapper function: Broadcast (message,data) to the server 
* 
* @param message String to name message type
* @param data Data to be sent to the server 
* @memberof module:client/Client
*/
Client.prototype.emit = function(message, data) {
    if(debug.client) debug.log("[Client] Emitting \"" + message + "\".");
    this.socket.emit("message", {name:message, data:data});
}

return new Client();

});

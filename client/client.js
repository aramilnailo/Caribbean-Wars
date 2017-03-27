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
	up:false,
	down:false,
	left:false,
	right:false,
	firing:false,
	sails:false
};
Client.prototype.loading = false;
Client.prototype.drawing = false;
Client.prototype.inGame = false;

Client.prototype.gameState = null;
Client.prototype.map = null;

/**cd 
* Registers all gui event messages associated with client state
* transistions.
*
* @memberof module:client/Client
*/
Client.prototype.listen = function(router) {
    if(debug.client) debug.log("client/client.js: listen()");
    router.listen("evalResponse", this.logToConsole);
    router.listen("alert", this.pushAlert);
}

/**
* Wrapper function: calls alert(data)
*
* @param data Alert message
* @memberof module:client/Client
*/
Client.prototype.pushAlert = function(data) {
    if (debug.client) debug.log("client/client.js: pushAlert()")
    alert(data);
}

/**
* Wrapper function: calls console.log(data)
*
* @param data String to output to console
* @memberof module:client/Client
*/
Client.prototype.logToConsole = function(data) {
	console.log(data);
}

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

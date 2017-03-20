/**
* Client class. Holds game data and user data.
* 
* @module client/Client
*/
define(["debug", "dom", "router"], function(debug, dom, router) {

var Client = function() {};

Client.prototype.username = "";
Client.prototype.usertype = "";
Client.prototype.inGame = false;
Client.prototype.socket = null;
Client.prototype.map = null;
Client.prototype.gameStateBuffer = [];

/**
* Registers all gui event messages associated with client state
* transistions.
*
* @memberof module:client/Client
*/
Client.prototype.listen = function(router) {
    if(debug.client) debug.log("client/client.js: listen()");
    router.listen("evalResponse", this.logToConsole);
    router.listen("alert", this.pushAlert);
    router.listen("newGameMapResponse", this.setMap);
    router.listen("getEditMapResponse", this.setMap); 
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
 * Sets the client's map data to the given parameter
 * @param data - the new map data
 */
Client.prototype.setMap = function(data) {
    if(debug.client) debug.log("client/client.js: setMap()");
    if(data.err) {
        alert(data.err);
	} else {
		Client.prototype.map = data;
	}
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

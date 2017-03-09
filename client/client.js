/**
* Client class. Holds game data and user data.
* 
* @module client/Client
*/
define(["debug", "dom", "router"], function(debug, dom, router) {

//srw: This class is basically session data class.

var Client = function() {};

/** 
* Username associated with current login 
*
* @memberof module:client/Client
*/
Client.prototype.username = "";

/** 
* Map object associated with current game 
*
* @memberof module:client/Client
*/
Client.prototype.mapData = {data:"", path:""};

/** 
* Server socket reference 
*
* @memberof module:client/Client
*/ 
Client.prototype.socket = null;

/** 
* List of players participating in the current game 
*
* @memberof module:client/Client
*/ 
Client.prototype.players = [];

//     The Client class contains nearly all of the data that I associated with
//     what we called "gamedata" and I had called the "client state".
//     We could either add this data + any additional needed data to implement
//     this class, or we could extract data currently held by this class to
//     create an alternate gamedata class.
    
// srw: recommend inserting additional client info here
// e.g. zoom level
    

    
/**
* Registers all gui event messages associated with client state
* transistions.
*
* @memberof module:client/Client
*/
Client.prototype.listen = function(router) {
	router.listen("collapseMenus", this.hideAllMenus);
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
* Hides all currently active menus.
*
* @param data Currently unused
* @memberof module:client/Client
*/
Client.prototype.hideAllMenus = function(data) {
	if(!dom.chatWindowHidden) router.route("toggleChatWindow", null);
	if(!dom.statsMenuHidden) router.route("toggleStatsMenu", null);
	if(!dom.savedGamesMenuHidden) router.route("toggleSavedGamesMenu", null);
	if(!dom.userListHidden) router.route("toggleUserList", null);
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

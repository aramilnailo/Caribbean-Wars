define(["debug", "dom", "router"], function(debug, dom, router) {

//srw: This class is basically session data class.

/**
* Client class. Holds game data and user data.
*/
var Client = function() {};

/** @public Username associated with current login */ Client.prototype.username = "";

/** @public Map object associated with current game */ Client.prototype.mapData = {data:"", path:""};
/** @public Server socket reference */ Client.prototype.socket = null;

    //      ... The Client class contains nearly all of the data that I associated with
    //          what we called "gamedata" and I had called the "client state".
    //      We could either add this data + any additional needed data to implement
    //     this class, or we could extract data currently held by this class to
    //     create an alternate gamedata class. 
    //     
/** List of players participating in the current game */ Client.prototype.players = [];    
// srw: recommend inserting additional client info here
// e.g. zoom level
    

    
/**
* Registers all gui event messages associated with client state
* transistions.
*/
Client.prototype.listen = function(router) {
	router.listen("collapseMenus", this.hideAllMenus);
	router.listen("mapData", this.setMap);
	router.listen("evalResponse", this.logToConsole);
	router.listen("alert", this.pushAlert);
}

/**
* Sets the current game map.
* 
* @param data Contains the current map as data.mapData.
* @throws alert error message if an error occurred
*         when attempting to set data.mapData.
*/
Client.prototype.setMap = function(data) {
    if(data.err) {
	   alert(data.err);
    } else {
       this.mapData = data;
    }
}

/**
* Wrapper function: calls alert(data)
*
* @param data Alert message
*/
Client.prototype.pushAlert = function(data) {
    alert(data);
}

/**
* Wrapper function: calls console.log(data)
*
* @param data String to output to console
*/
Client.prototype.logToConsole = function(data) {
	console.log(data);
}

/**
* Hides all currently active menus.
*
* @param data Currently unused
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
*/
Client.prototype.emit = function(message, data) {
    if(debug.client) debug.log("[Client] Emitting \"" + message + "\".");
    this.socket.emit("message", {name:message, data:data});
}

return new Client();

});

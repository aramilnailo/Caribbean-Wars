define(["debug", "dom", "router"], function(debug, dom, router) {

//srw: This class is basically session data class.
    
var Client = function() {};

Client.prototype.username = "";

Client.prototype.mapData = {data:"", path:""};
Client.prototype.socket = null;

// srw: needed for rendering.
Client.prototype.players = [];    
    // srw: recommend inserting additional client info here
    // e.g. zoom level
    
    
Client.prototype.listen = function(router) {
	router.listen("collapseMenus", this.hideAllMenus);
	router.listen("mapData", this.setMap);
	router.listen("evalResponse", this.logToConsole);
	router.listen("alert", this.pushAlert);
}

Client.prototype.setMap = function(data) {
    if(data.err) {
	   alert(data.err);
    } else {
       this.mapData = data;
    }
}

Client.prototype.pushAlert = function(data) {
    alert(data);
}

Client.prototype.logToConsole = function(data) {
	console.log(data);
}

Client.prototype.hideAllMenus = function(data) {
	if(!dom.chatWindowHidden) router.route("toggleChatWindow", null);
	if(!dom.statsMenuHidden) router.route("toggleStatsMenu", null);
	if(!dom.savedGamesMenuHidden) router.route("toggleSavedGamesMenu", null);
	if(!dom.userListHidden) router.route("toggleUserList", null);
}

Client.prototype.emit = function(message, data) {
    if(debug.client) debug.log("[Client] Emitting \"" + message + "\".");
    this.socket.emit("message", {name:message, data:data});
}

return new Client();

});

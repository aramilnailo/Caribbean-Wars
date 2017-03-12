define(["debug", "dom", "router"], function(debug, dom, router) {

//srw: This class is basically session data class.
    
var Client = function() {};
    /*
    var client = {
	username:"",
	usertype:"",
	map:{data:"",path:""}
    };

    return client;
    
};
    */
    
Client.prototype.username = "";
Client.prototype.usertype = "";
Client.prototype.map = {data:"", path:""};

Client.prototype.socket = null;

// srw: needed for rendering.
Client.prototype.players = [];    
    // srw: recommend inserting additional client info here
    // e.g. zoom level
    
    
Client.prototype.listen = function(router) {
	router.listen("collapseMenus", this.hideAllMenus);
	router.listen("newGameMapResponse", this.setMap);
	router.listen("evalResponse", this.logToConsole);
        router.listen("alert", this.pushAlert);
        router.listen("adminAccessRequired",this.adminAccessRequired);
}

Client.prototype.setMap = function(data) {
    if(debug.client) debug.log("client/client.js: setMap()");
    if(data.err) {
	   alert(data.err);
    } else {
	this.map = data;
	if (debug.client) debug.log("client/client.js: data.lx,ly=="+this.map.lx+","+this.map.ly);
    }
}

Client.prototype.pushAlert = function(data) {
    alert(data);
}

Client.prototype.logToConsole = function(data) {
	console.log(data);
}

// srw: hideAllMenus should be in view.js
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

Client.prototype.adminAccessRequired = function(data) {
    alert("Admin access required");
}
    
return new Client();

});

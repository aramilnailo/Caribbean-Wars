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
* Usertype associated with current login 
*
* @memberof module:client/Client
*/
Client.prototype.usertype = "";

/** 
* Map object associated with current game 
*
* @memberof module:client/Client
*/
Client.prototype.map = {lx:0, ly:0, path:"", author:"", name:"", data:[]};

Client.prototype.setMap = function(data) {
    if(debug.client) debug.log("client/client.js: setMap()");
    if(data.err) {
        alert(data.err);
	} else {
		Client.prototype.map = data;
	}
}
    

/*    
Client.prototype.map.at = function (i,j) {
    var index = this.data.ly*i + j;
    if (index >= 0 && index < this.lx*this.ly) {
	return data[this.ly*i + j];
    }
}

    
Client.prototype.map.set = function (i,j,val) {
    var index = this.data.ly*i + j;
    if (index >= 0 && index < this.lx*this.ly) {
	this.data[this.ly*i + j] = val;
    }
}

Client.prototype.map.copyOf = function (m2) {
    m2.lx = this.lx;
    m2.ly = this.ly;
    m2.path = this.path;
    m2.author = this.author;
    m2.data.length = this.data.length;
    m2.name = this.name;
    
    m2.at = function (i,j) {
	return this.data[this.ly*i + j];
    };
    
    m2.set = function (i,j,val) {
	var index = this.ly*i + j;
	if (index >= 0 && index < this.lx*this.ly) {
	    this.data[this.ly*i + j] = val;
	}
    }
    
    var i,j;
    for (i = 0; i < this.lx; i++)
	for (j = 0; j < this.ly; j++)
	    m2.set(i,j,this.at(i,j));
}
  */  
    
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
    if(debug.client) debug.log("client/client.js: listen()");
    router.listen("collapseMenus", this.hideAllMenus);
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
* Hides all currently active menus.
*
* @param data Currently unused
* @memberof module:client/Client
*/
// srw: hideAllMenus should be in view.js
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

Client.prototype.adminAccessRequired = function(data) {
    alert("Admin access required");
}
    
return new Client();

});

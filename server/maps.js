
var debug = require("./debug.js").maps;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");
var files = require("./files.js");

var GAME_SESSION = require("./session.js").GAME_SESSION;

/**
* The Maps namespace contains functions relating to loading
* map data from the file system and emitting it to clients.
*/
var Maps = function() {};

/**
* Registers the functions in this namespace with the given
* message router.
* @param router - the message router
*/
Maps.prototype.listen = function(router) {
    router.listen("getMap", this.getMap);
    router.listen("loadNewMap",this.loadNewMap);
}

/**
* Emits the map data associated with the game session
* to the client requesting it. If there is no map data,
* the data read from "./assets/map" is associated with 
* the game session before emitting.
* @param param - data passed by the router
* @param param.client - the client requesting the information
*/
Maps.prototype.getMap = function(param) {
    if (debug) {
	log("server: inside getMap()");
    }
    var client = param.client;
    var data = param.data;
	if(GAME_SESSION.map === "") GAME_SESSION.map = "./assets/map";
	files.readFile(GAME_SESSION.map, function(data) {
	    if(data) {
		server.emit(client.socket, "mapData", {data:data, path:GAME_SESSION.map});
	    } else {
		  server.emit(client.socket, "alert", "Could not read from map file");
	    }
	});
}

/**
* Loads the map data from a given filepath, associates it 
* with the game session, and emits it to all clients.
* @param param - data passed by the router
* @param param.client - client attempting the load
* @param param.data - the username and filename
* @param param.clients - the client list
*/
Maps.prototype.loadNewMap = function(param) {
    var client = param.client;
    var CLIENT_LIST = param.clients;
    var filename = param.data.filename;
    var username = param.data.username;
    if(!GAME_SESSION.host || username != GAME_SESSION.host.username) {
        server.emit(client.socket, "alert", "Only host can load maps.");
    } else {
	var i;
	dbi.getMapFilePath(filename, function(path) {
	    if(path) {
            files.readFile(path, function(data) {
                if(data) {
                    GAME_SESSION.map = path;
                    for(var i in CLIENT_LIST) {
                        server.emit(CLIENT_LIST[i].socket, "mapData", {data:data, path:path});
                    }
                }
            });
	    } else {
		server.emit(client.socket, "alert", "Could not read from map file.");
	    }
	});
    }
}

    

module.exports = new Maps();

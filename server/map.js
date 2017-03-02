
var debug = require("./debug.js").map;
var log = require("./debug.js").log;

var server = require("./server.js");

var Map = function () {};

//================ MAP OBJECT =================

Maps.prototype.listen = function(router) {
    router.listen("getMap", this.getMap);
    router.listen("loadNewMap",this.loadNewMap);
}

//map constructor
var Map = function(LX,LY) {
    var map = {
	lx:LX,
	ly:LY,
	author:"nobody",
	name:"arrr"
    };
    map.grid = [];
    map.charAt = function (i,j) {
	return map.grid[LY*i + j];
    };

    grid.length = LX*LY;
    var i,j,ch;
    for (i = 0; i < LX; i++)
	for (j = 0; j < LY; j++) 
	    (map.charAt(i,j)) = "0";
    return map;
};


Map.prototype.getMap = function(param) {
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
                        CLIENT_LIST[i].socket.emit("mapData", {data:data, path:path});
                    }
                }
            });
	    } else {
			server.emit(client.socket, "alert", "Could not read from map file.");
	    }
	});
    }
}

module.exports = Map;






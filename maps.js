
var debug = require("./debug.js").maps;
var log = require("./debug.js").log;

var files = require("./files.js");
var GAME_SESSION = require("./gamesessions.js").GAME_SESSION;

var dbi = require("./dbi.js");

var Maps = function() {};

Maps.prototype.listen = function(sox) {
    sox.listen("getMap", this.getMap);
    sox.listen("loadNewMap",this.loadNewMap);
}
    
Maps.prototype.getMap = function(param) {
    if (debug) {
	log("server: getMap: call to getMap");
	if (param.client) log("getMap: param.client !null");
	if(param.data) log("getMap: param.data !null")
	log ("GAME_SESSION="+GAME_SESSION);
	log ("GAME_SESSION.map="+GAME_SESSION.map);
    }
    var client = param.client;
    var data = param.data;
	if(GAME_SESSION.map === "") GAME_SESSION.map = "./assets/map";
	files.readFile(GAME_SESSION.map, function(data) {
	    if(data) {
		if (debug) log("server: emit mapData");
		if (debug) log("GAME_SESSION.map="+GAME_SESSION.map);
		if (client.socket) log ("client.socket !null");
		  client.socket.emit("mapData", {data:data, path:GAME_SESSION.map});
	    } else {
		if (debug) log("emit alert");
		  client.socket.emit("alert", "Could not read from map file");
	    }
	});
}

Maps.prototype.loadNewMap = function(param) {
    var client = param.client;
    var CLIENT_LIST = param.clients;
    var filename = param.data.filename;
    var username = param.data.username;
    if(!GAME_SESSION.host || username != GAME_SESSION.host.username) {
        client.socket.emit("alert", "Only host can load maps.");
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
            client.socket.emit("alert", "Could not read from map file.");
	    }
	});
    }
}

module.exports = new Maps();


var debug = require("./debug.js").maps;
var log = require("./debug.js").log;

var dbi = require("./dbi.js");
var files = require("./files.js");

var CLIENT_LIST = require("./sox.js").client_list;
var GAME_SESSION = require("./gamesessions.js").GAME_SESSION;

var Maps = function() {};

Maps.prototype.listen = function(sox) {
    sox.listen("getMap", this.getMap);
    sox.listen("loadNewMap",this.loadNewMap);
}
    
Maps.prototype.getMap = function(param) {
    var client = param.client;
    var data = param.data;
	if(GAME_SESSION.map === "") GAME_SESSION.map = "./assets/map";
	files.readFile(GAME_SESSION.map, function(data) {
	    if(data) {
		  client.socket.emit("mapData", {data:data, path:GAME_SESSION.map});
	    } else {
		  client.socket.emit("alert", "Could not read from map file");
	    }
	});
}

Maps.prototype.loadNewMap = function(param) {
    var client = param.client;
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
                    for(i in CLIENT_LIST) {
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


/*******************

This functionality should be merged into the Map class (underway)

*******************/

var debug = require("./debug.js").maps;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");
var files = require("./files.js");

var GAME_SESSION = require("./session.js").GAME_SESSION;

var dbi = require("./dbi.js");

var Maps = function() {};

Maps.prototype.listen = function(router) {
    router.listen("getGameMap", this.getGameMap);
    router.listen("loadNewGameMap",this.loadNewGameMap);
    router.listen("loadMapCopy",this.loadMapCopy);
    router.listen("saveMap",this.saveMap);
}

Maps.prototype.getGameMap = function(param) {
    if (debug) {
	log("server/maps: getGameMap()");
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

Maps.prototype.loadNewGameMap = function(param) {
    if (debug) log("server: loadNewGameMap()");
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
			    CLIENT_LIST[i].socket.emit("newGameMapResponse", {data:data, path:path});
			}
		    }
		});
	    } else {
		server.emit(client.socket, "alert", "Could not read from map file.");
	    }
	});
    }
}

Maps.prototype.loadMapCopy = function(param) {
    var client = param.client;
    var filename = param.data.filename;
    var username = param.data.username;
    var usertype = param.data.usertype;
    if(usertype != "editor") {
	server.emit(client.socket, "alert", "Map write access restricted to map editors.");
    } else {
	var i;
	dbi.getMapFilePath(filename, function(path) {
	    if(path) {
		files.readFile(path, function(data) {
		    if(data) {
			// Make a copy
			var newpath = path + "copy";
			var err;
			files.saveFile(data,newpath,err);
			if (err) {
			    server.emit(client.socket, "alert", "Could not write map copy.");
			} else {
			    //Save copy name to database
			    dbi.saveGameFilename({author:username,file_name:filename,map_file_path:newpath},
						 function(valid) {
						     if(!valid) {
							 server.emit(client.socket, "alert", "Could not write map path to database.");
						     } });
			    //Send copy data to client
			    files.readFile(data,function(copy) {
				client.socket.emit("mapEditCopyResponse", copy);
			    });
			}
		    }
		});
	    } else {
		server.emit(client.socket, "alert", "Could not read from map file.");
	    }
	});
    }
}  

Maps.prototype.saveMap = function(param) {
    var client = param.client;
    var filename = param.data.filename;
    var newpath = param.data.path;
    var username = param.data.username;
    var usertype = param.data.usertype;
    if(usertype != "editor") {
	server.emit(client.socket, "alert", "Map read/write access restricted to map editors.");
    } else {
	dbi.getMapFilePath(filename, function(path) {
	    if (!path) {
		dbi.saveGameFilename({author:username,file_name:filename,map_file_path:path},function(err) {
		    if (err) {
			server.emit(client.socket, "alert", "Could not save " + filename);
		    }
		})
	    }
	});
	var err;
	files.saveFile(data,newpath,err);
	if (err) {
	    //should delete filename from db as well, if stored.
	    server.emit(client.socket, "alert", "Could not write map copy.");
	}
    }
}



/*
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
*/
    

module.exports = new Maps();

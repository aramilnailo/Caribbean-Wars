
var debug = require("./debug.js").maps;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");
var files = require("./files.js");

var GAME_SESSION = require("./session.js").GAME_SESSION;

/**
* The Maps namespace contains functions relating to loading
* map data from the file system and emitting it to clients.
* @module server/Maps
*/
var Maps = function() {};

/**
* Registers the functions in this namespace with the given
* message router.
* @param router - the message router
* @memberof module:server/Maps
*/
Maps.prototype.listen = function(router) {
    router.listen("getGameMap", this.getGameMap);
    router.listen("getEditMap", this.getEditMap);
    //router.listen("loadNewGameMap",this.loadNewGameMap);
    //router.listen("loadMapCopy",this.loadMapCopy);
    router.listen("saveMap",this.saveMap);
    router.listen("loadSavedMap",this.loadSavedEditMap);
}

/**
* Emits the map data associated with the game session
* to the client requesting it. If there is no map data,
* the data read from "./assets/map" is associated with 
* the game session before emitting.
* @param param - data passed by the router
* @param param.client - the client requesting the information
* @memberof module:server/Maps
*/
Maps.prototype.getGameMap = function(param) {
    if (debug) {
	log("server/maps: getGameMap()");
    }
    var client = param.client;
    //var data = param.data;
    if(GAME_SESSION.map === "") GAME_SESSION.map = "./assets/map";
    files.readFile(GAME_SESSION.map, function(data) {
	if(data) {
	    //server.emit(client.socket, "newGameMapResponse", {data:data, path:GAME_SESSION.map});
	    server.emit(client.socket, "newGameMapResponse", data);
	} else {
	    server.emit(client.socket, "alert", "Could not read from map file");
	}
    });
}


Maps.prototype.getEditMap = function(param) {
    if (debug) {
	log("server/maps: getEditMap()");
    }
    //var filename = param.data.filename;
    var client = param.client;
    var username = param.data.username;
    var usertype = param.data.usertype;
    //if (debug) log("server/maps.js, getEditMap(): filename="+filename);
    if (debug) log("server/maps.js, getEditMap(): username="+param.data.username);
    if (debug) log("server/maps.js, getEditMap(): usertype="+param.data.usertype);
    
    if(usertype != "editor") {
	server.emit(client.socket, "alert", "Map write access restricted to map editors.");
    } else {
	if(! param.data.filename) param.data.filename = "defaulteditmap";
	dbi.getMapFilePath(param.data.filename, function(path) {
	    if (debug) log("server/maps.js, getEditMap(): path = "+path);
	    if(path) {
		files.readFile(path, function(data) {	
		    if(data) {
			//server.emit(client.socket, "newGameMapResponse", {data:data, path:GAME_SESSION.map});
			server.emit(client.socket, "getEditMapResponse", data);
		    } else {
			server.emit(client.socket, "alert", "Could not load "+param.data.filename);
		    }
		});
	    }
	});
    }
}

/**
* Loads the map data from a given filepath, associates it 
* with the game session, and emits it to all clients.
* @param param - data passed by the router
* @param param.client - client attempting the load
* @param param.data - the username and filename
* @param param.clients - the client list
* @memberof module:server/Maps
*/
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
    if (debug) log("server/maps.js, loadMapCopy(): filename="+filename);
    if (debug) log("server/maps.js, loadMapCopy(): username="+param.data.username);
    if (debug) log("server/maps.js, loadMapCopy(): usertype="+param.data.usertype);
    
    if(usertype != "editor") {
	server.emit(client.socket, "alert", "Map write access restricted to map editors.");
    } else {
	var i;
	dbi.getMapFilePath(filename, function(path) {
	    if(debug) log("maps.js: path="+path);
	    if(path) {
		if(debug) log("maps.js: path="+path);
		files.readFile(path, function(data) {
		    if(data) {
			// Make a copy
			var newpath = "" + path + "copy";
			if(debug) log("maps.js: copy; newpath="+newpath);
			
			files.saveFile(data,newpath,function(err) {
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
			});
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
    

module.exports = new Maps();

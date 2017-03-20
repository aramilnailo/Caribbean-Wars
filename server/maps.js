
var debug = require("./debug.js").maps;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");
var files = require("./files.js");

var clients = require("./router.js").client_list;

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
    if(debug) log("[Maps] listen()");
    router.listen("getEditMap", this.getEditMap);
    router.listen("saveMapRequest",this.saveMap);
    router.listen("loadSavedMap",this.loadSavedEditMap); // jtjudge: loadMapCopy ??
    router.listen("savedMapsListRequest",this.savedMapsListRequest);
}

Maps.prototype.savedMapsListRequest = function(param) {
    if (debug) log ("server/maps.js: savedMapsListRequest()");
    var client = param.client;
    dbi.getSavedMapsList(function(data) {
		server.emit(client.socket,"savedMapsListResponse",data);
    });
}

Maps.prototype.getEditMap = function(param) {
    if (debug) log("server/maps: getEditMap()");
    var filename = param.data.filename;
    var client = param.client;
    if(client.usertype != "editor") {
		server.emit(client.socket, "alert", "Map write access restricted to map editors.");
    } else {
		dbi.getMapFilePath(filename, function(path) {
		    if(debug) log("server/maps.js, getEditMap(): path = "+path);
		    if(path) {
				files.readFile(path, function(data) {	
				    if(data) {
						server.emit(client.socket, "getEditMapResponse", data);
				    } else {
						server.emit(client.socket, "alert", "Could not load " + filename);
				    }
				});
		    } else {
		    	server.emit(client.socket, "alert", "Could not read from filepath");
		    }
		});
    }
}

Maps.prototype.loadMapCopy = function(param) {
    var client = param.client;
    var filename = param.data.filename;
    if(debug) log("server/maps.js, loadMapCopy(): filename="+filename);
    if(client.usertype != "editor") {
		server.emit(client.socket, "alert", "Map write access restricted to map editors.");
    } else {
		var i;
		dbi.getMapFilePath(filename, function(path) {
		    if(debug) log("maps.js: path="+path);
		    if(path) {
				files.readFile(path, function(data) {
				    if(data) {
						// Make a copy
						var newpath = path + ".copy";
						if(debug) log("maps.js: copy; newpath=" + newpath);
						files.saveFile(data, newpath, function(err) {
						    if(err) {
								server.emit(client.socket, "alert", "Could not write map copy.");
						    } else {
								//Save copy name to database
								dbi.saveGameFilename({author:client.username, file_name:filename, map_file_path:newpath},
									function(valid) {
										if(!valid) {
											server.emit(client.socket, "alert", "Could not write map path to database.");
										}
								});
						    }
						});
						//Send copy data to client
						client.socket.emit("mapEditCopyResponse", data);
				    } else {
				    	server.emit(client.socket, "alert", "Could not read from map file.");
				    }
				});
		    } else {
				server.emit(client.socket, "alert", "Could not read from file path.");
		    }
		});
    }
}  

Maps.prototype.saveMap = function(param) {
    var client = param.client;
    var filename = param.data.filename;
    if(debug) log("server/maps.js, loadMapCopy(): filename="+filename);
    if(client.usertype != "editor") {
		server.emit(client.socket, "alert", "Map read/write access restricted to map editors.");
    } else {
		var path = "./assets/" + filename + ".map";
		dbi.saveMapFilename({author:client.username, filename:filename, map_file_path:path}, 
			function(err) {
			    if(err) {
					server.emit(client.socket, 
						"alert", "Could not save " + filename);
			    } else {
					files.saveFile(param.data.map, path, function(err) {
					    if(err) {
							//should delete filename from db as well, if stored.
							server.emit(client.socket, "alert", "Could not save " + filename);
							dbi.removeSavedMap({author:client.username, filename:filename}, function(err) {});
					    } else {
					    	server.emit(client.socket, "alert", "Saved " + filename);
					    }
					});
			    }
		});
    }
}

// Refreshes the map editor screen
Maps.prototype.updateEditor = function() {
	for(var i in clients) {
		var c = clients[i];
		if(c.usertype === "editor") {
			server.emit(c.socket, "refreshEditScreen", null);
		}
	}
}
    

module.exports = new Maps();

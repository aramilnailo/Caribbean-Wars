
var debug = require("./debug.js").maps;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");

/**
* The Maps namespace contains functions relating to loading
* map data from the database and emitting it to clients.
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
    router.listen("saveEditMap",this.saveEditMap);
    router.listen("loadEditMap",this.loadEditMap);
	router.listen("deleteMap", this.deleteMap);
    router.listen("savedMapsListRequest",this.savedMapsListRequest);
}

Maps.prototype.saveEditMap = function(param) {
    var client = param.client;
    var filename = param.data.filename;
    if(debug) log("server/maps.js, saveEditMap(): filename="+filename);
	dbi.addSavedMap({author:client.username, file_name:filename, map:param.data.map}, 
		function(resp) {
		    if(resp) {
				server.emit(client.socket, "alert", "Saved " + filename);
			    dbi.getSavedMapsList(function(data) {
					for(var i in param.clients) {
						var c = param.clients[i];
						server.emit(c.socket,"savedMapsListResponse",data);
					}
			    });
		    } else {
				server.emit(client.socket, 
					"alert", "Could not save " + filename);
		    }
	});
}

Maps.prototype.loadEditMap = function(param) {
    var client = param.client;
    var filename = param.data;
	if(debug) log("server/maps.js, loadEditMap(): filename="+filename);
	dbi.getSavedMap(filename, function(data) {
		if(data) {
			//Send copy data to client
			server.emit(client.socket, "loadEditMapResponse", data);
			server.emit(client.socket, "alert", "Loaded " + filename);
		} else if(filename === "default") {
			// Ensure that a map called "default" is always in the db
			var map = {
				width:100,
				height:100,
				author:"admin",
				name:"default",
				data:[],
				ports:[]
			};
			var line = "";
			for(var i = 0; i < 10; i++) line += "0000000000";
			for(var i = 0; i < 100; i++) map.data.push(line);
			var pack = {
				author:map.author, 
				file_name:map.name,
				map:map
			}; 
			dbi.addSavedMap(pack, function(resp) {
				if(resp) {
					server.emit(client.socket, "loadEditMapResponse", map);
					server.emit(client.socket, 
						"alert", "Re-added and loaded default");
				} else {
					server.emit(client.socket, 
						"alert", "Database failure");
				}
			});
		} else {
		   	server.emit(client.socket, "alert", "Could not load " + filename);
		}
	});
}  

Maps.prototype.deleteMap = function(param) {
    var client = param.client;
    var filename = param.data;
	if(debug) log("server/maps.js, deleteMap(): filename="+filename);
	dbi.removeSavedMap(filename, client.username, function(resp) {
		if(resp) {
			server.emit(client.socket, "alert", "Deleted " + filename);
		    dbi.getSavedMapsList(function(data) {
				for(var i in param.clients) {
					var c = param.clients[i];
					server.emit(c.socket,"savedMapsListResponse",data);
				}
		    });
		} else {
			server.emit(client.socket, "alert", "Could not delete " + filename);
		}
	});
}

Maps.prototype.savedMapsListRequest = function(param) {
    if (debug) log ("server/maps.js: savedMapsListRequest()");
    var client = param.client;
    dbi.getSavedMapsList(function(data) {
		server.emit(client.socket,"savedMapsListResponse",data);
    });
}

module.exports = new Maps();

var debug = require("./debug.js").saves;
var log = require("./debug.js").log;

var dbi = require("./dbi.js");
var server = require("./server.js");
	
var Saves = function() {}

Saves.prototype.listen = function(router) {
	router.listen("deleteSavedGame", this.deleteSavedGame);
	router.listen("saveGameRequest", this.saveGameRequest);
	router.listen("savedGamesListRequest", this.savedGamesListRequest);
}

Saves.prototype.deleteSavedGame = function(param) {
    var client = param.client;
    var data = param.data;
	dbi.removeSavedGame({file_name:data, author:client.player.username},
		function(resp) {
        var msg = resp ? "Deleted \"" + data + "\"." : 
                    "Could not delete \"" + data + "\".";
        server.emit(client.socket, "alert", msg);
    });
}

Saves.prototype.saveGameRequest = function(param) {
    var client = param.client;
    var data = param.data;
	dbi.saveGameFilename(data, function(resp) {
        var msg = resp ? "Saved \"" + data.file_name + "\"." :
                        "Could not save \"" + data.file_name + "\".";
		server.emit(client.socket, "alert", msg);
    });
}

Saves.prototype.savedGamesListRequest = function(param) {
    var client = param.client;
    var data = param.data;
	dbi.getSavedGamesList(function(data) {
	    server.emit(client.socket, "savedGamesListResponse", data);
	});
}

module.exports = new Saves();
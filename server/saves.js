var debug = require("./debug.js").saves;
var log = require("./debug.js").log;

var dbi = require("./dbi.js");
var server = require("./server.js");

/**
* The saves namespace contains functions relating to
* modifying the saved games database.
*/
var Saves = function() {}

/**
* Registers functions in this namespace with the given
* message router.
* @param router - the message router
*/
Saves.prototype.listen = function(router) {
	router.listen("deleteSavedGame", this.deleteSavedGame);
	router.listen("saveGameRequest", this.saveGameRequest);
	router.listen("savedGamesListRequest", this.savedGamesListRequest);
}

/**
* Removes the given saved game from the saved games
* database. Only the author or admins can delete a 
* saved game.
* @param param - data passed by the router
* @param param.client - the client attempting the deletion
* @param param.data - the filename of the saved game
*/
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

/**
* Creates a new saved game with the given author.
* @param param - data passed by the router
* @param param.client - client attempting to save
* @param param.data - file name
*/
Saves.prototype.saveGameRequest = function(param) {
    var client = param.client;
    var data = param.data;
	dbi.saveGameFilename(data, function(resp) {
        var msg = resp ? "Saved \"" + data.file_name + "\"." :
                        "Could not save \"" + data.file_name + "\".";
		server.emit(client.socket, "alert", msg);
    });
}

/**
* Retrieves the saved games list and emits it to
* the requesting client.
* @param param - data passed by the router
* @param param.client - client requesting the list
*/
Saves.prototype.savedGamesListRequest = function(param) {
    var client = param.client;
    var data = param.data;
	dbi.getSavedGamesList(function(data) {
	    server.emit(client.socket, "savedGamesListResponse", data);
	});
}

module.exports = new Saves();
var debug = require("./debug.js").saves;
var log = require("./debug.js").log;

var dbi = require("./dbi.js");
var server = require("./server.js");

/**
* The saves namespace contains functions relating to
* modifying the saved games database.
* @module server/saves
*/
var Saves = function() {}

/**
* Registers functions in this namespace with the given
* message router.
* @param router - the message router
* @memberof module:server/saves
*/
Saves.prototype.listen = function(router) {
    if(debug) log("[Saves] listen()");
    router.listen("deleteSavedGame", this.deleteSavedGame);
    router.listen("savedGamesListRequest", this.savedGamesListRequest);
}

/**
* Removes the given saved game from the saved games
* database. Only the author or admins can delete a 
* saved game.
* @param param - data passed by the router
* @param param.client - the client attempting the deletion
* @param param.data - the filename of the saved game
* @memberof module:server/saves
*/
Saves.prototype.deleteSavedGame = function(param) {
    var client = param.client;
    var filename = param.data;
	dbi.removeSavedGame(filename, client.username,
		function(resp) {
        var msg = resp ? "Deleted \"" + filename + "\"." : 
                    "Could not delete \"" + filename + "\".";
        server.emit(client.socket, "alert", msg);
    });
}

/**
* Retrieves the saved games list and emits it to
* the requesting client.
* @param param - data passed by the router
* @param param.client - client requesting the list
* @memberof module:server/saves
*/
Saves.prototype.savedGamesListRequest = function(param) {
    var client = param.client;
    var data = param.data;
	dbi.getSavedGamesList(function(data) {
	    server.emit(client.socket, "savedGamesListResponse", data);
	});
}

module.exports = new Saves();

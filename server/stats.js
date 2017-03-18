var debug = require("./debug.js").stats;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");

/**
* The stats namespace contains functions that modify the user
* stats database table.
* @module server/stats
*/
var Stats = function () {};

/**
* Registers functions in this namespace with the given
* message router.
* @param router - the message router
* @memberof module:server/stats
*/
Stats.prototype.listen = function(router) {
    if(debug) log("[Stats] listen()");
    router.listen("statsMenuRequest",this.statsMenuRequest);
	router.listen("clearStats", this.clearStats);
}

/**
* Returns the user stats table rows to the client
* requesting them.
* @param param - data passed by the router
* @param param.client - client requesting the stats
* @memberof module:server/stats
*/
Stats.prototype.statsMenuRequest = function(param) {
    if (debug) log("server/stats.js: statsMenuRequest()");
    var client = param.client;
	dbi.getAllStats(function(data) {
	    if(data) {
		  server.emit(client.socket, "statsMenuResponse", data);
	    }
	});
}

/**
* Resets the stats of the given user to zero.
* @param param - data passed by the router
* @param param.data - username whose stats are to be reset
* @memberof module:server/stats
*/
Stats.prototype.clearStats = function(param) {
    if (debug) log("server/stats.js: clearStats()");
	var username = param.data;
	if(debug) log(username);
	dbi.removeUserStats(username, function(resp) {
		if(!resp && debug) log("Error in clearStats");
	});
	dbi.addUserStats(username, function(resp) {
		if(!resp && debug) log("Error in clearStats");
	});	
}

module.exports = new Stats();

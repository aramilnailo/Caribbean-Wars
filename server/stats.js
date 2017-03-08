
var debug = require("./debug.js").stats;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");

/**
* The stats namespace contains functions that modify the user
* stats database table.
*/
var Stats = function () {};

/**
* Registers functions in this namespace with the given
* message router.
* @param router - the message router
*/
Stats.prototype.listen = function(router) {
    router.listen("statsMenuRequest",this.statsMenuRequest);
	router.listen("clearStats", this.clearStats);
}

/**
* Returns the user stats table rows to the client
* requesting them.
* @param param - data passed by the router
* @param param.client - client requesting the stats
*/
Stats.prototype.statsMenuRequest = function(param) {
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
*/
Stats.prototype.clearStats = function(param) {
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

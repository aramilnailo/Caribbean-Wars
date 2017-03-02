
var debug = require("./debug.js").stats;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");

var Stats = function () {};

Stats.prototype.listen = function(router) {
    router.listen("statsMenuRequest",this.statsMenuRequest);
	router.listen("clearStats", this.clearStats);
}

Stats.prototype.statsMenuRequest = function(param) {
    var client = param.client;
	dbi.getAllStats(function(data) {
	    if(data) {
		  server.emit(client.socket, "statsMenuResponse", data);
	    }
	});
}

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


var debug = require("./debug.js").stats;
var log = require("./debug.js").log;

var server = require("./server.js");
var dbi = require("./dbi.js");

var Stats = function () {};

Stats.prototype.listen = function(router) {
    router.listen("statsMenuRequest",this.statsMenuRequest);
}

Stats.prototype.statsMenuRequest = function(param) {
    var client = param.client;
	dbi.getAllStats(function(data) {
	    if(data) {
		  server.emit(client.socket, "statsMenuResponse", data);
	    }
	});
}

module.exports = new Stats();


var debug = require("./debug.js").stats;
var log = require("./debug.js").log;

var dbi = require("./dbi.js");

var Stats = function () {};

Stats.prototype.listen = function(sox) {
    sox.listen("statsMenuRequest",this.statsMenuRequest);
}

Stats.prototype.statsMenuRequest = function(param) {
    var client = param.client;
	dbi.getAllStats(function(data) {
	    if(data) {
		  client.socket.emit("statsMenuResponse", data);
	    }
	});
}

module.exports = new Stats();

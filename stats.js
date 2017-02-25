
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

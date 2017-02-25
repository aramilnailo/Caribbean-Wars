

var Sox = function () { };

var client_list = [];

Sox.prototype.initialize = function(s) {
    this.socs = s;
}

Sox.prototype.listen = function(msg,action) {
    this.socs.on("connection", function(socket) {
	var client = {"socket":socket, "player":null};
	client_list.push(client);
	socket.on(msg, function (data) {
	    data.socket = socket;
	    data.client_list = this.client_list;
	    data.client = client;
	    action(data);
	});
    });
}


module.exports = new Sox();




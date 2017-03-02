
var debug = require("./debug.js").router;
var log = require("./debug.js").log;

var DOM = require("./dom.js");
var client = require("./client.js");

var Router = function() {}

var listeners = [];

Router.prototype.listen(msg, action) {
    var listener = {name:msg, func:action};
    // listeners with indices at i do not change
    // after splice when we move backwards
	var i = listeners.length - 1;
    while (i >= 0) {
		if (listeners[i] === listener) {
		    listeners.splice(i, 1);
		}
		i--;
	}
}

Router.prototype.route(msg) {
    for (var i in listeners) {
	if (listeners[i].name === msg.name) {
	    listeners[i].func(msg.data);
	}
}

module.exports = new Router();
define(["debug"], function(debug) {

var Router = function() {}

var listeners = [];

Router.prototype.listen = function(msg, action) {
	listeners.push({name:msg, func:action});
}

Router.prototype.unlisten = function(msg, action) {
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

Router.prototype.route = function(msg) {
    for (var i in listeners) {
		if (listeners[i].name === msg.name) {
		    listeners[i].func(msg.data);
		}
	}
}

return new Router();

});
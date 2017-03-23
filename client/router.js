/**
* Router class. Maintains list of message/function pairs. When
* a message arrives over the socket, all functions listening for
* that message will be called, in the order in which they were
* added to the list.
*
* @module client/Router
*/
define(["debug"], function(debug) {

var Router = function() {}

/**
* @private Queue of (message, function) pairs.
* @memberof module:client/Router
*/
var listeners = [];

/**
* Add (message, function) pair to the listener list.
* Called by each listening class.
*
* @param msg The message (string) arriving from the server
* @param action Reference to a function of the form f(data) 
* @memberof module:client/Router
*/
Router.prototype.listen = function(msg, action) {
	if(debug.router) debug.log("[Client] Listening for \"" + msg + "\"");
	listeners.push({name:msg, func:action});
}

/**
* Remove (msg, action) from the listeners queue. Does nothing
* if (msg, action) not currently in the queue.
* 
* @param msg The message (string) 
* @param action Reference to a function of the form f(data) 
* @memberof module:client/Router
*/
Router.prototype.unlisten = function(msg, action) {
    if (debug.router) debug.log("[Client] Unlistening to \"" + msg + "\"");
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
    
/**
* When msg arrives from the server, calls all functions
* in the listeners queue who are currently listing for 
* this message, in the order in which they were added
* to the queue.
*
* @param msg String describing the message sent by the
*            server.
* @memberof module:client/Router
*/
Router.prototype.route = function(msg) {
	if(debug.router) {
		if(msg.name !== "gameUpdate" && 
			msg.name !== "refreshEditScreen") debug.log("[Client] Routing \"" + msg.name + "\"");
	}
    for (var i in listeners) {
		if (listeners[i].name === msg.name) {
		    listeners[i].func(msg.data);
		}
	}
}

return new Router();

});

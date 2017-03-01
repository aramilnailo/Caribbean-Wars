
var debug = require("./debug.js").router;
var log = require("./debug.js").log;

var Router = function () { };

var client_list = [];
var listeners = [];

Router.prototype.listen = function(msg,action) {
    if (debug) log("Router: listening for "+msg);
    listeners.push({name:msg,func:action});
}

// ... will remove all matching calls
// if any are identical
Router.prototype.unlisten = function(msg,action) {
    if (debug) log("Router: unlistening to "+msg);
    var i = listeners.length-1;
    var L = {name:msg, func:action};
    // ele's with indices lt i do not change
    // after splice when we move backwards
    while (i >= 0) {
	if (listeners[i] === L)
	    listeners.splice(i,1);
	i--;
    }
}

// assumes: 
//   msg.socket
//   msg.name
//   msg.data
Router.prototype.route = function(msg) {
    
    if (debug) log("Router: Routing " + msg.name);
    
    var socket = msg.socket;

    var client = client_list.find(function(c) {
	return (c.socket === socket);
    });

    if (client === undefined) {
	if(debug) log("Router: pushing new client");
	client = {socket:socket, player:null};
	client_list.push(client);
    }  
    var param = {client:client, clients:client_list, call:msg.name, data:msg.data};
    for (var i in listeners) {
	if (listeners[i].name === msg.name) {
	    if(debug) log("Calling " + msg.name);
	    listeners[i].func(param);
	}
    }
}


module.exports = new Router();
module.exports.client_list = client_list;


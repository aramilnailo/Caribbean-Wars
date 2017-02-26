
var debug = require("./debug.js").sox;
var log = require("./debug.js").log;

var Sox = function () { };

var client_list = [];
var listeners = [];

Sox.prototype.listen = function(msg,action) {
    if (debug) log("sox: listening for "+msg);
    listeners.push({name:msg,func:action});
}

// ... will remove all matching calls
// if any are identical
Sox.prototype.unlisten = function(msg,action) {
    if (debug) log("sox: unlistening to "+msg);
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
Sox.prototype.route = function(msg) {
    
    if (debug) log("sox: Routing " + msg.name);
    
    var socket = msg.socket;
    var client = client_list.find(function(c) {
	return c.socket == socket;
    });
    if (client === undefined) {
	if(debug) log("sox: pushing new client");
	client = {socket:socket, player:null};
	client_list.push(client);
    }
    if (debug) log("sox: client_list.length = "+ client_list.length);    
    var param = {client:client, clients:client_list, call:msg.name, data:msg.data};
    for (var i in listeners) {
	if (listeners[i].name === msg.name) {
	    if(debug) log("Calling " + msg.name);
	    listeners[i].func(param);
	}
    }
}


module.exports = new Sox();
module.exports.clients = client_list;



/**
* Flags used to control debug output.
*
* @module client/debug
*/
define([], function() {

var debug = {
	client:true,
	router:true,
	chat:true, 
	saves:true,
	login:true,
	stats:true,
	render:true,
	view:true
}

/**
* Wrapper to determine processing of debug message.
*
* @memberof module:client/debug
* @param msg String to log as debug output
*/
debug.log = function(msg) {
    console.log(msg);
}

return debug;

});

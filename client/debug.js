define([], function() {

/**
*
*/
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
*
*/
debug.log = function(msg) {
    console.log(msg);
}

return debug;

});

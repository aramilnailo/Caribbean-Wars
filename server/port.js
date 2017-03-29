var Port = function(x, y, bb) {
	
	var port = {
		x:x,
		y:y,
		occupied:false,
		resources:[],
		dockArea:bb
	};
	
	return port;
};

module.exports = Port;
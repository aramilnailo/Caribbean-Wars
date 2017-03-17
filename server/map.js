
var debug = require("./debug.js").map;
var log = require("./debug.js").log;

var server = require("./server.js");

//================ MAP OBJECT =================

/**
* The map object containing the terrain data in the game.
* @module server/Map
*/
var Map = function() {
    var map = {
	lx:0,
	ly:0,
	dx:1,
	dy:1,
	path:"",
	author:"nobody",
	name:"newmapfile",
	data:[],
	ports:[]
    };

    return map;
};

// not currently used.
Map.prototype.waterMapCode = 0;
Map.prototype.sandMapCode = 1;
Map.prototype.grassMapCode = 2;

module.exports = Map;






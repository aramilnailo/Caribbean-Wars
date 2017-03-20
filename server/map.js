
var debug = require("./debug.js").map;
var log = require("./debug.js").log;

var server = require("./server.js");

//================ MAP OBJECT =================

// note: screen focus on center = (cx,cy)
/**
* The map object containing the terrain data in the game.
* @module server/Map
*/
var Map = function() {
    var map = {
	width:0,
	height:0,
	path:"",
	author:"",
	name:"",
	data:[],
	ports:[]
    };

    return map;
};

module.exports = Map;






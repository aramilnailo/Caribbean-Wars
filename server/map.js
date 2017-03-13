
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
	path:"",
	author:"nobody",
	name:"newmapfile",
	data:[],
	ports:[]
    };

    map.at = function (i,j) {
	return map.data[this.ly*i + j];
    };

    map.set = function (i,j,val) {
	if (ly*i+j < this.lx*this.ly) {
	    map.data[this.ly*this.lx] = val;
	}
    }

    map.data.length = LX*LY;
    var i,j;
    for (i = 0; i < LX; i++)
	for (j = 0; j < LY; j++) 
	    this.set(i,j,this.waterMapCode);
    
    return map;
};

Map.prototype.waterMapCode = 0;
Map.prototype.landMapCode = 1;
Map.prototype.woodsMapCode = 2;

module.exports = Map;






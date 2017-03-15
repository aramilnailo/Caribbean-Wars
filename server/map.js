
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
	var index = this.ly*i + j;
	if (index >= 0 && index < this.lx*this.ly) {
	    map.data[this.ly*i + j] = val;
	}
    }

    map.copy() = function () {
	m2 = new Map();
	m2.lx = this.lx;
	m2.ly = this.ly;
	m2.path = this.path;
	m2.author = this.author;
	m2.data.length = this.data.length;
	m2.name = this.name;
	var i,j;
	for (i = 0; i < this.lx; i++)
	    for (j = 0; j < this.ly; j++)
		m2.set(i,j,this.at(i,j));
	return m2;
    }
        
    return map;
};

// not currently used.
Map.prototype.waterMapCode = 0;
Map.prototype.landMapCode = 1;
Map.prototype.woodsMapCode = 2;

module.exports = Map;






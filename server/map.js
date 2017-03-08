
var debug = require("./debug.js").map;
var log = require("./debug.js").log;

var server = require("./server.js");

/**
* The map object containing the terrain data in the game.
*/
var Map = function () {};

/**
* Constructs a map object with the given dimensions.
* @param LX - length in the x-direction
* @param LY - length in the y-direction
*/
var Map = function(LX,LY) {
    var map = {
	lx:LX,
	ly:LY,
	author:"nobody",
	name:"arrr"
    };
    map.grid = [];
    map.charAt = function (i,j) {
	return map.grid[LY*i + j];
    };

    grid.length = LX*LY;
    var i,j,ch;
    for (i = 0; i < LX; i++)
	for (j = 0; j < LY; j++) 
	    (map.charAt(i,j)) = "0";
    return map;
};

module.exports = Map;






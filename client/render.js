
var debug = require("./debug.js").render;
var log = require("./debug.js").log;

var DOM = require("./dom.js");

var Render = function() {}

Render.prototype.listen = function(router) {
	router.listen("newPositions", drawScreen);
}

Render.prototype.drawScreen = function(data) {
    var i, j, ch;
    // Clear screen
    DOM.canvas.clearRect(0, 0, 500, 500);
    // Draw the map
    for(i = 0; i < 10; i++) {
	for(j = 0; j < 10; j++) {
	    // 0 = blue, 1 = tan, 2 = green
	    ch = mapData.data[11 * i + j]; // Current cell
	    DOM.canvas.fillStyle = (ch == "0") ? "#42C5F4" :
		(ch == "1") ? "#C19E70" : "#2A8C23";
	    DOM.canvas.fillRect(j * 50, i * 50, 50, 50);
	}
    }
    // Draw the players in black
    DOM.canvas.fillStyle = "#000000";
    for(i = 0; i < data.length; i++) {
	DOM.canvas.fillText(data[i].number, data[i].x, data[i].y);
    }
}

module.exports = new Render();
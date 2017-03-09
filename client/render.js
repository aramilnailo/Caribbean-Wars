/**
* Class responsible for rendering the gamestate 
* on client system.
*
* @module client/Render
*/
define(["debug", "dom", "client"], function(debug, dom, client) {

var Render = function() {};

/**
* Register gui events implemented by this
* class.
*
* @memberof module:client/Render
* @param router Class that routes gui messages
*               to listeners
*/
Render.prototype.listen = function(router) {
	router.listen("newPositions", this.drawScreen);
}

/**
* Test function that paints the GUI canvas element
* 
* @memberof module:client/Render
* @param data Currently just a stub that contains
*             info on all players (number, x, y)
*/
Render.prototype.drawScreen = function(data) {
    var i, j, ch;
	var map = client.mapData.data;
    // Clear screen
    dom.canvas.clearRect(0, 0, 500, 500);
    // Draw the map
    for(i = 0; i < 10; i++) {
	for(j = 0; j < 10; j++) {
	    // 0 = blue, 1 = tan, 2 = green
	    ch = map[11 * i + j]; // Current cell
	    dom.canvas.fillStyle = (ch == "0") ? "#42C5F4" :
		(ch == "1") ? "#C19E70" : "#2A8C23";
	    dom.canvas.fillRect(j * 50, i * 50, 50, 50);
	}
    }
    // Draw the players in black
    dom.canvas.fillStyle = "#000000";
    for(i = 0; i < data.length; i++) {
	dom.canvas.fillText(data[i].number, data[i].x, data[i].y);
    }
}

return new Render();

});

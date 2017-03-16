/**
* Class responsible for rendering the gamestate 
* on client system.
*
* @module client/Render
*/
define(["debug", "dom", "client"], function(debug, dom, client) {

var log = debug.log;
    
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
    if(debug.render) log("client/render.js: listen()");
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
    if(debug.render) log("client/render.js: drawScreen()");
    var i, j, ch;
    // Clear screen
    dom.canvas.clearRect(0, 0, 500, 500);
    // Draw the map
    if(debug.render) log("client/render.js: client.username="+client.username);
    if(debug.render) log("client/render.js: client.usertype="+client.usertype);
    var ly = client.map.ly;
    var lx = client.map.lx;
    if(debug.render) log("client/render.js: client.map.lx,ly="+client.map.lx+","+client.map.ly);
    for(i = 0; i < lx; i++) {
	for(j = 0; j < ly; j++) {
	    // 0 = blue, 1 = tan, 2 = green
	    ch = client.map.data[ly * i + j]; // Current cell
	    var color; 
	    switch (ch) {
	    case 0 : color = "#42C5F4";
		break;
	    case 1 : color = "#C19E70";
		break;
	    case 2 : color = "#2A8C23";
		break;
	    default : color = "#000000";
	    }
	    dom.canvas.fillStyle = color;
	    dom.canvas.fillRect(j * 50, i * 50, 50, 50);
	    /*
	    dom.canvas.fillStyle = (ch == "0") ? "#42C5F4" :
		(ch == "1") ? "#C19E70" : "#2A8C23";
	    dom.canvas.fillRect(j * 50, i * 50, 50, 50);
	    */
	}
    }
    // Draw the players as black squares
    dom.canvas.fillStyle = "#000000";
    for(i = 0; i < data.length; i++) {
	dom.canvas.fillRect(data[i].x, data[i].y, 10, 10);
    }
}

return new Render();

});

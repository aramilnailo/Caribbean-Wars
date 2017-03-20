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
	if(!client.map) return;
	
	var map = client.map.data;
	
	// camera position in cells
	var cam_x = client.camera.x;
	var cam_y = client.camera.y; 
	
	// camera dimensions in cells
	var cam_w = 20 / client.camera.zoom;
	var cam_h = 20 / client.camera.zoom;
	
	// camera dimensions in pixels
	var width = 500;
	var height = 500;
	
	// cell dimensions in pixels
	var cell_w = width / cam_w; 
	var cell_h = height / cam_h;
	
	// Draw camera
	for(var i = 0; i < cam_h; i++) {
		var line = map[i + cam_y];
		for(var j = 0; j < cam_w; j++) {
			var ch, color;
			if(line) ch = line.charAt(j + cam_x);
		    switch(ch) {
		    	case "0": 
					color = "#42C5F4";
					break;
		    	case "1": 
					color = "#C19E70";
					break;
		    	case "2":
					color = "#2A8C23";
					break;
		    	default: 
					color = "#000000";
		    }
		    dom.canvas.fillStyle = color;
		    dom.canvas.fillRect(j * cell_w, i * cell_h, cell_w, cell_h);
		}
	}
	
	// In the upper left corner, draw camera's position in world map
	dom.canvas.clearRect(500, 0, 100, 500);
	dom.canvas.strokeStyle = "#000000"; // Black
	dom.canvas.strokeRect(500, 0, 100, 100);
	var rel_x = Math.floor(100 * cam_x / client.map.width);
	var rel_y = Math.floor(100 * cam_y / client.map.height);
	var rel_w = Math.floor(100 * cam_w / client.map.width);
	var rel_h = Math.floor(100 * cam_h / client.map.height);
	dom.canvas.strokeStyle = "#ff0000"; // Red
	dom.canvas.strokeRect(500 + rel_x, 0 + rel_y, rel_w, rel_h);
	
    // Draw the players as black squares
    dom.canvas.fillStyle = "#000000";
	dom.canvas.font = "10px Arial";
    for(i = 0; i < data.length; i++) {
		var shifted_x = data[i].x * client.camera.zoom - cam_x * cell_w;
		var shifted_y = data[i].y * client.camera.zoom - cam_y * cell_h;
		dom.canvas.fillRect(shifted_x, shifted_y, 10 * client.camera.zoom, 10 * client.camera.zoom);
		dom.canvas.fillText(data[i].name, shifted_x - 10, shifted_y - 10);
    }
}

return new Render();

});

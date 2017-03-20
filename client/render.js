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
	if(client.map) {
		var map = client.map.data;
		var cam_x = client.camera.x;
		var cam_y = client.camera.y;
		
		var width = 500; // camera width in pixels
		var height = 500; // camera height in pixels
		
		var cells_in_cam_x = 20; // camera width in cells
		var cells_in_cam_y = 20; // camera height in cells
		
		var cell_w = 500 / 20; // cell width in pixels
		var cell_h = 500 / 20; // cell height in pixels
		
		// Draw map
		for(var i = 0; i < cells_in_cam_y; i++) {
			var line = map[i + cam_y];
			for(var j = 0; j < cells_in_cam_x; j++) {
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
	}
    // Draw the players as black squares
    dom.canvas.fillStyle = "#000000";
	dom.canvas.font = "10px Arial";
    for(i = 0; i < data.length; i++) {
		var shifted_x = data[i].x - cam_x * cell_w;
		var shifted_y = data[i].y - cam_y * cell_h;
		dom.canvas.fillRect(shifted_x, shifted_y, 10, 10);
		dom.canvas.fillText(data[i].name, shifted_x - 10, shifted_y - 10);
    }
}

return new Render();

});

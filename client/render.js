/**
* Class responsible for rendering the gamestate 
* on client system.
*
* @module client/Render
*/
define(["debug", "dom", "client"], function(debug, dom, client) {

var log = debug.log;
    
var Render = function() {};

// loading images to be displayed
var shipImage = new Image();
var cannonballImage = new Image();
shipImage.src = "client/imgs/shipImage.png";
cannonballImage.src = "client/imgs/cannonballImage.png";

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
    router.listen("gameUpdate", this.drawScreen);
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
	
	// Render the ships
	dom.canvas.fillStyle = "#000000";
	dom.canvas.strokeStyle = "#000000";
	dom.canvas.font = "10px Arial";
    for(var i in data.ships) {
		var s = data.ships[i];

		// Transform the coordinates
		var shifted_x = (s.box.x - cam_x) * cell_w;
		var shifted_y = (s.box.y - cam_y) * cell_h;
		var shifted_w = s.box.w * cell_w;
		var shifted_h = s.box.h * cell_h;
		
		// Draw image
		dom.canvas.save();
		dom.canvas.translate(
			shifted_x, 
			shifted_y
		);
		dom.canvas.rotate(data.ships[i].box.dir);
		dom.canvas.drawImage(
			shipImage, 
			-shifted_w/2, 
			-shifted_h/2, 
			shifted_w,
			shifted_h
		);
		dom.canvas.restore();
		
		if(debug) {
		// Draw bounding box
		var verts = s.box.verts;
		dom.canvas.beginPath();
		dom.canvas.moveTo((verts[0].x - cam_x) * cell_w, (verts[0].y - cam_y) * cell_h);
		for(var j = 1; j < verts.length; j++) {
			dom.canvas.lineTo((verts[j].x - cam_x) * cell_w, (verts[j].y - cam_y) * cell_h);
		}
		dom.canvas.lineTo((verts[0].x - cam_x) * cell_w, (verts[0].y - cam_y) * cell_h);
		dom.canvas.lineTo((s.box.x - cam_x) * cell_w, (s.box.y - cam_y) * cell_h);
		dom.canvas.stroke();
		}
		
		// Draw name
		if(data.ships[i].name === client.username) {
			dom.canvas.fillText(">" + data.ships[i].name + "<", 
			shifted_x - 10, shifted_y - 10);
		} else {
			dom.canvas.fillText(data.ships[i].name, 
				shifted_x - 10, shifted_y - 10);
		}
    }
	
	// Render projectiles
	for(var i in data.projectiles) {
		var p = data.projectiles[i];
		
		// Transform coordinates
		var shifted_x = (p.box.x - cam_x) * cell_w;
		var shifted_y = (p.box.y - cam_y) * cell_h;
		var shifted_w = p.box.w * cell_w;
		var shifted_h = p.box.h * cell_h;
		
		if(debug) {
		// Draw bounding box
		var verts = p.box.verts;
		dom.canvas.beginPath();
		dom.canvas.moveTo((verts[0].x - cam_x) * cell_w, (verts[0].y - cam_y) * cell_h);
		for(var j = 1; j < verts.length; j++) {
			dom.canvas.lineTo((verts[j].x - cam_x) * cell_w, (verts[j].y - cam_y) * cell_h);
		}
		dom.canvas.lineTo((verts[0].x - cam_x) * cell_w, (verts[0].y - cam_y) * cell_h);
		dom.canvas.lineTo((p.box.x - cam_x) * cell_w, (p.box.y - cam_y) * cell_h);
		dom.canvas.stroke();
		}
		
		// Draw image
		dom.canvas.save();
		dom.canvas.translate(
			shifted_x, 
			shifted_y
		);
		dom.canvas.rotate(p.box.dir);
		dom.canvas.drawImage(
			cannonballImage,
			-shifted_w / 2, 
			-shifted_h / 2,
			shifted_w,
			shifted_h
		);
		dom.canvas.restore();
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
	
	// Draw the player positions on the minimap
	dom.canvas.fillStyle = "#ff0000"; // Red
   	for(var i in data.ships) {
		var p_rel_x = Math.floor(100 * data.ships[i].box.x / client.map.width);
		var p_rel_y = Math.floor(100 * data.ships[i].box.y / client.map.height);
		
		var p_rel_w = Math.max(3, Math.floor(100 * data.ships[i].box.w / client.map.width));
		var p_rel_h = Math.max(3, Math.floor(100 * data.ships[i].box.h / client.map.width));
		
		dom.canvas.fillRect(500 + p_rel_x, 0 + p_rel_y, p_rel_w, p_rel_h);
    }
	
}

return new Render();

});

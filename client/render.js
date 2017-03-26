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

var render_next = [];

var CANVAS_W = 500, CANVAS_H = 500,
	CELL_W = 20, CELL_H = 20,
	MINI_X = 500, MINI_Y = 0,
	MINI_W = 100, MINI_H = 100,
	MENU_X = 500, MENU_Y = 100,
	MENU_W = 100, MENU_H = 400;

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
}

/**
* Paints the given map to the canvas according to the
* client zoom level
* 
* @memberof module:client/Render
* @param data - map data
*/
Render.prototype.drawCamera = function(map) {
	if(!client.camera.moved) return;
	dom.canvas.clearRect(0, 0, CANVAS_W, CANVAS_H);
	client.drawing = true;
	// camera position in cells
	var cam_x = client.camera.x;
	var cam_y = client.camera.y;
	// camera dimensions in cells
	var min = Math.min(client.map.width, client.map.height);
	var cam_w = Math.floor(min / client.camera.zoom);
	var cam_h = Math.floor(min / client.camera.zoom);
	// cell dimensions in pixels
	var cell_w = CANVAS_W / cam_w;
	var cell_h = CANVAS_H / cam_h;
	// Draw camera
	for(var i = 0; i < cam_h; i++) {
		var line = map.data[i + cam_y];
		for(var j = 0; j < cam_w; j++) {
			var ch;
			if(line) ch = line.charAt(j + cam_x);
		    dom.canvas.fillStyle = getColor(ch);
		    dom.canvas.fillRect(
				j * cell_w, 
				i * cell_h, 
				cell_w, 
				cell_h
			);
		}
	}
	client.drawing = false;
	client.camera.moved = false;
}

Render.prototype.drawGameState = function(data) {
	client.drawing = true;
	var map = data.map;
	var ships = data.state.ships;
	var projectiles = data.state.projectiles;
	
	// camera position in cells
	var cam_x = client.camera.x;
	var cam_y = client.camera.y;
	// camera dimensions in cells
	var min = Math.min(client.map.width, client.map.height);
	var cam_w = Math.floor(min / client.camera.zoom);
	var cam_h = Math.floor(min / client.camera.zoom);
	// cell dimensions in pixels
	var cell_w = CANVAS_W / cam_w;
	var cell_h = CANVAS_H / cam_h;
	
	// Re-render any map cells affected last round
	while(render_next.length > 0) {
		var coords = render_next.pop(),
		line = map.data[coords.y], ch;
		if(line) ch = line.charAt(coords.x);
	    dom.canvas.fillStyle = getColor(ch);
	    dom.canvas.fillRect(
			(coords.x - cam_x) * cell_w, 
			(coords.y - cam_y) * cell_h, 
			cell_w, 
			cell_h
		);
	}
	
	// Render the ships
	dom.canvas.fillStyle = "#000000";
	dom.canvas.strokeStyle = "#000000";
	dom.canvas.font = "10px Arial";
    for(var i in ships) {
		var s = ships[i];
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
		dom.canvas.rotate(ships[i].box.dir);
		dom.canvas.drawImage(
			shipImage, 
			-shifted_w/2, 
			-shifted_h/2, 
			shifted_w,
			shifted_h
		);
		dom.canvas.restore();
		// Store coords affected by bounding box
		// to render next round
		var bx = Math.floor(s.box.x), 
			by = Math.floor(s.box.y), 
			val = 3 * Math.max(
				Math.ceil(s.box.w), 
				Math.ceil(s.box.h)
			);
		// Refresh the surrounding 3x3
		for(var j = -val; j < val; j++) {
			for(var k = -val; k < val; k++) {
				var coords = {
					x:bx + k,
					y:by + j
				};
				if(render_next.indexOf(coords) === -1) {
					render_next.push(coords);
				}
			}
		}
		if(debug) {
			var verts = s.box.verts;
			// Draw bounding box
			dom.canvas.beginPath();
			dom.canvas.moveTo(
				(verts[0].x - cam_x) * cell_w, 
				(verts[0].y - cam_y) * cell_h
			);
			for(var j = 1; j < verts.length; j++) {
				dom.canvas.lineTo(
					(verts[j].x - cam_x) * cell_w, 
					(verts[j].y - cam_y) * cell_h
				);
			}
			dom.canvas.lineTo(
				(verts[0].x - cam_x) * cell_w, 
				(verts[0].y - cam_y) * cell_h
			);
			dom.canvas.stroke();
		}
		var txt = "";
		// Draw name
		if(ships[i].name === client.username) {
			txt += ships[i].name + 
			": " + ships[i].health + 
			", " + ships[i].ammo;
			dom.canvas.fillStyle = "#00ff00"; // Green
		} else {
			txt += ships[i].name;
			dom.canvas.fillStyle = "#ff0000"; // Red
		}
		dom.canvas.fillText(txt, 
			shifted_x - shifted_w, 
			shifted_y - shifted_w
		);
		// Add affected cells to be re-rendered
		var txt_x = Math.floor(s.box.x - s.box.w);
		var txt_y = Math.floor(s.box.y - s.box.w);
		var txt_w = Math.ceil(
			dom.canvas.measureText(txt).width * 
			cam_w / CANVAS_W
		) + 5;
		var txt_h = Math.ceil(txt_w / 10);
		// Refresh the surrounding 3x3
		for(var j = -txt_h; j < txt_h; j++) {
			for(var k = 0; k < txt_w; k++) {
				var coords = {
					x:txt_x + k,
					y:txt_y + j
				};
				if(render_next.indexOf(coords) === -1) {
					render_next.push(coords);
				}
			}
		}
		
    }
	
	// Render projectiles
	for(var i in projectiles) {
		var p = projectiles[i];
		// Transform coordinates
		var shifted_x = (p.box.x - cam_x) * cell_w;
		var shifted_y = (p.box.y - cam_y) * cell_h;
		var shifted_w = p.box.w * cell_w;
		var shifted_h = p.box.h * cell_h;
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
		// Add verts for next screen refresh

		var bx = Math.floor(p.box.x), 
			by = Math.floor(p.box.y), 
			val = 3 * Math.max(
				Math.ceil(p.box.w), 
				Math.ceil(p.box.h)
			);
		// Refresh the surrounding 3x3
		for(var j = -val; j < val; j++) {
			for(var k = -val; k < val; k++) {
				var coords = {
					x:bx + k,
					y:by + j
				};
				if(render_next.indexOf(coords) === -1) {
					render_next.push(coords);
				}
			}
		}
		if(debug) {
			// Draw bounding box
			var verts = p.box.verts;
			dom.canvas.beginPath();
			dom.canvas.moveTo(
				(verts[0].x - cam_x) * cell_w, 
				(verts[0].y - cam_y) * cell_h
			);
			for(var j = 1; j < verts.length; j++) {
				dom.canvas.lineTo(
					(verts[j].x - cam_x) * cell_w, 
					(verts[j].y - cam_y) * cell_h
				);
			}
			dom.canvas.lineTo(
				(verts[0].x - cam_x) * cell_w, 
				(verts[0].y - cam_y) * cell_h
			);
			dom.canvas.stroke();
		}
	}
	
	
	// Clear the menu and minimap
	dom.canvas.clearRect(
		MENU_X, MENU_Y, 
		MENU_W, MENU_H
	);
	dom.canvas.clearRect(
		MINI_X, MINI_Y, 
		MINI_W, MINI_H
	);
	// In the upper left corner, draw camera's position in world map
	dom.canvas.strokeStyle = "#000000"; // Black
	dom.canvas.strokeRect(500, 0, 100, 100);
	var rel_x = Math.floor(
		MINI_W * cam_x / map.width
	);
	var rel_y = Math.floor(
		MINI_H * cam_y / map.height
	);
	var rel_w = Math.floor(
		MINI_W * cam_w / map.width
	);
	var rel_h = Math.floor(
		MINI_H * cam_h / map.height
	);
	dom.canvas.strokeStyle = "#ff0000"; // Red
	dom.canvas.strokeRect(
		MINI_X + rel_x, 
		MINI_Y + rel_y, 
		rel_w, 
		rel_h
	);
	// Draw the player positions on the minimap
	dom.canvas.fillStyle = "#ff0000"; // Red
   	for(var i in ships) {
		var p_rel_x = Math.floor(
			MINI_W * ships[i].box.x / map.width
		);
		var p_rel_y = Math.floor(
			MINI_H * ships[i].box.y / map.height
		);
		var p_rel_w = Math.floor(
			MINI_W * ships[i].box.w / map.width
		); 
		var p_rel_h = Math.floor(
			MINI_H * ships[i].box.h / map.width
		);
		p_rel_w = Math.max(0.05 * MINI_W, p_rel_w);
		p_rel_h = Math.max(0.05 * MINI_H, p_rel_h);
		dom.canvas.fillRect(
			MINI_X + p_rel_x, 
			MINI_Y + p_rel_y, 
			p_rel_w, 
			p_rel_h
		);
    }
	
	client.drawing = false;
}


function getColor(ch) {
	var color;
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
	return color;
}

return new Render();

});

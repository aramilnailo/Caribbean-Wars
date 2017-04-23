/**
* Class responsible for rendering the gamestate 
* on client system.
*
* @module client/Render
*/
define(["debug", "dom", "client"], function(debug, dom, client) {
	
var log = debug.log;
var debug = debug.render;

var Render = function() {};

// loading images to be displayed
var arrow = new Image(), ball = new Image(), 
ship = new Image(), barrel = new Image(), 
sand = new Image(), 
grass = new Image(), port = new Image(), 
defaultCell = new Image();
//, ocean = new Image(), 
    
arrow.src = "client/imgs/arrow.png";
ball.src = "client/imgs/ball.png";
ship.src = "client/imgs/shipcannon.png";
barrel.src = "client/imgs/barrel.png";
sand.src = "client/imgs/sand.png";
grass.src = "client/imgs/grass.png";
port.src = "client/imgs/dock.png";
defaultCell.src = "client/imgs/default.png";

var render_next = [];
var CANVAS_W = 500, CANVAS_H = 500,
	CELL_W = 20, CELL_H = 20,
	MINI_X = 500, MINI_Y = 0,
	MINI_W = 100, MINI_H = 100,
	MENU_X = 500, MENU_Y = 100,
	MENU_W = 100, MENU_H = 400;

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
	for(var i = cam_y; i < cam_y + cam_h; i++) {
		var line = map.data[Math.floor(i)];
		for(var j = cam_x; j < cam_x + cam_w; j++) {
			var ch;
			var printImage;
			if(line) ch = line.charAt(Math.floor(j));
			printImage = getCellImage(ch);
			if(printImage) {
				dom.canvas.drawImage(
					printImage,
					(Math.floor(j) - cam_x) * cell_w, 
					(Math.floor(i) - cam_y) * cell_h,
					cell_w, 
					cell_h
				);
			} else {
				// Invisible terrain
				dom.canvas.clearRect(
					j * cell_w, 
					i * cell_h, 
					cell_w, 
					cell_h
				);
			}
		}
	}
	client.drawing = false;
	client.camera.moved = false;
}

var autotargets = [];
Render.prototype.drawGameState = function(data) {
	// Starting
	client.drawing = true;
	// Extract data sent from server
	var map = data.map;
	var ships = data.state.ships;
	var projectiles = data.state.projectiles;
	var resources = data.state.resources;
	var wind = data.state.wind;
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
	// === GAME SCREEN ===
	// Re-render any map cells affected last round
	while(render_next.length > 0) {
		var coords = render_next.pop(),
		line = map.data[coords.y], ch;
		if(line) ch = line.charAt(coords.x);
		var printImage = getCellImage(ch);
		if(printImage) {
			dom.canvas.drawImage(
				printImage,
				(coords.x - cam_x) * cell_w, 
				(coords.y - cam_y) * cell_h, 
				cell_w, 
				cell_h
			);
		} else {
			dom.canvas.clearRect(
				(coords.x - cam_x) * cell_w, 
				(coords.y - cam_y) * cell_h, 
				cell_w, 
				cell_h
			);
		}
	}
    for (var a in autotargets) {
	var auto = autotargets.shift();
	dom.canvas.clearRect(auto.x-1,auto.y-1,auto.size+2,auto.size+2);
    }
        dom.canvas.fillStyle = "#000000";
	dom.canvas.strokeStyle = "#000000";
	dom.canvas.font = "10px Arial";
	// Render the ships
	var imgData = {
		img:ship,
		x:-0.5,
		y:-0.75,
		w:1.5,
		h:1.5
	};
	renderBoxes(ships, imgData, render_next);
	// Render projectiles
	imgData = {
		img:ball,
		x:-0.5,
		y:-0.5,
		w:1,
		h:1
	}
	renderBoxes(projectiles, imgData, render_next);
	// Render resources
	imgData.img = barrel;
	renderBoxes(resources, imgData, render_next);
	// Render ship info, floating name
	for(var i in ships) {
		var s = ships[i];
		var shifted_x = (s.box.x - cam_x) * cell_w;
		var shifted_y = (s.box.y - cam_y) * cell_h;
		var shifted_w = s.box.w * cell_w;
		var shifted_h = s.box.h * cell_h;
		var txt = "";
		// Draw name
		if(s.name.split("-")[0] === client.username) {
			txt += s.name;
			if(s.selected) {
				txt +=
				": " + s.health.toFixed(1) + 
				", " + s.ammo.loaded + 
				" / " + s.ammo.unloaded;
			}
			dom.canvas.fillStyle = "#00a524"; // Green
		} else {
			txt += s.name;
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

	    //console.log("render: myShip="+data.state.myShip);
	    //console.log("render: s.orders.length="+s.orders.length);
	    // Draw autopilot target positions
	    if (i === data.state.myShip && s.orders.length > 0) {
   		for(var j in s.orders) {
		    if (j === 0 || s.orders[j].name === "goto") {
			var px = (s.orders[j].coords.x - cam_x) * cell_w;
			var py = (s.orders[j].coords.y - cam_y) * cell_h;
			autotargets.push({x:px,y:py,size:5});
			dom.canvas.fillStyle = "#ff0000"; // Red
			dom.canvas.fillRect(px,py,5,5);
		    } else {
			var target_ship = null;
			target_ship = ships.find(function(tget) {
			    return tget.name === s.orders[j].target;
			});
			if (target_ship && target_ship.active) {
			    var px = (target_ship.box.x - cam_x) * cell_w;
			    var py = (target_ship.box.y - cam_y) * cell_h;
			    autotargets.push({x:px,y:py,size:3});
			    dom.canvas.fillStyle = "#ffffff"; // White
			    dom.canvas.fillRect(px,py,3,3);
			}
		    }
		}
	    }
	    
	}
	
	// === MINI MAP AND MENU ===
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
	// Draw the wind direction
	if(wind) {
		var dir = Math.atan2(wind.y, wind.x).toFixed(2);
		dom.canvas.save();
		dom.canvas.translate(
			MENU_X + 20, 
			MENU_Y + 20
		);
		dom.canvas.rotate(dir);
		dom.canvas.drawImage(
			arrow, 
			-10, -5, 
			20, 10
		);
		dom.canvas.restore();
	}
	// Finishing
	client.drawing = false;
}

// Helper method renders the list of boxes with given
// image data, and pushes affected cells to render stack
function renderBoxes(list, imgData, renderStack) {
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
	for(var i in list) {
		var b = list[i];
		// Transform coordinates
		var shifted_x = (b.box.x - cam_x) * cell_w;
		var shifted_y = (b.box.y - cam_y) * cell_h;
		var shifted_w = b.box.w * cell_w;
		var shifted_h = b.box.h * cell_h;
		// Draw image
		dom.canvas.save();
		dom.canvas.translate(
			shifted_x, 
			shifted_y
		);
		dom.canvas.rotate(b.box.dir);
		if(imgData.img === ship){
			var sailsOffset = b.state.sails ? 1 : 0;
			var firingOffset = 0;
			// if not already firing and state is set to firing
			if(b.ammo.loaded > 0) {
				if(b.state.firingLeft) {
					firingOffset = 1 + Math.floor(b.state.firingCount * 3);
					if(firingOffset > 3) firingOffset = 3;
				} else if(b.state.firingRight) {
					firingOffset = 4 + Math.floor(b.state.firingCount * 3);
					if(firingOffset > 6) firingOffset = 6;
				}
			}
			dom.canvas.drawImage(
				imgData.img,
				sailsOffset*(ship.width/2),
				firingOffset*(ship.height/7),
				ship.width/2,
				ship.height/7,
				shifted_w * imgData.x,
				shifted_h * imgData.y,
				shifted_w * imgData.w,
				shifted_h * imgData.h
			);
		} else {
			dom.canvas.drawImage(
				imgData.img,
				shifted_w * imgData.x, 
				shifted_h * imgData.y, 
				shifted_w * imgData.w, 
				shifted_h * imgData.h
			);
		}
		dom.canvas.restore();
		// Add cells for next screen refresh
		var bx = Math.floor(b.box.x), 
		by = Math.floor(b.box.y), 
		val = Math.max(
			Math.ceil(b.box.w), 
			Math.ceil(b.box.h)
			) + 3;
		for(var j = -val; j < val; j++) {
			for(var k = -val; k < val; k++) {
				var coords = {
					x:bx + k,
					y:by + j
				};
				if(renderStack.indexOf(coords) === -1) {
					renderStack.push(coords);
				}
			}
		}
		if(debug) {
			// Draw bounding box
			var verts = b.box.verts;
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
}

function getColor(ch) {
	var color;
	switch(ch) {
		case "0": // Water -- blue
			color = "#42C5F4";
			break;
		case "1": // Sand -- tan
			color = "#C19E70";
			break;
		case "2": // Grass -- green
			color = "#2A8C23";
			break;
		case "3": // Port -- gray
			color = "#696969";
			break;
		case "4": // Resource spawn -- invisible
			color = "#42C5F4";
			break;
		case "5": // Player spawn -- invisible
			color = "#42C5F4";
			break;
		case "6": // Dock -- invisible
			color = "#42C5F4";
			break;
		default: // Invalid -- black
			color = "#000000";
			break;
	}
	return color;
}

function getCellImage(ch) {
	var image;
	switch(ch) {
		case "1": // Sand
			image = sand;
			break;
		case "2": // Grass
			image = grass;
			break;
		case "3": // Port
			image = port;
			break;
		default: // Transparent
			image = null;
			break;
	}
	return image;
}


// ================ OCEAN WAVES ===================


// ocean wave height
var w0 = [], w1 = [], w2 = [];
// speed of waves, squared, in pixels/timestep
var speed = 0.5;
// Initialized flag
var first = true;

//initialization, called once per game
function initializeOcean() {
	// choose initial wave vectors.
	var nvecs = 20;
	var theta = [];
	for (var n = 0; n < nvecs; n++) {
		theta.push(2*Math.PI*Math.random());
	}

	var lambda = [];
	var height = [];
	var L0 = 50.0;
	var temp = 1.0;
	var nogood = true;

	// Sample wave frequencies from
	// Maxwell-Boltmann distribution.
	while (nogood) {
		nogood = false;
		lambda = [];
		height = [];
		var prob = [];
		var sum = 0;
		while (lambda.length < nvecs) {
			var l = L0*Math.random() + 5;
			var h = (Math.random() + 0.01)/1.01;
			lambda.push(l);
			height.push(h);
			var energy = 2*Math.PI*Math.PI*speed*h*h/l/l;
			var p = Math.exp(-energy/temp); 
			prob.push(p);
			sum += p;
		}
		for (n = 0; n < nvecs; n++) {
			var flip = Math.random();
			if (flip < prob[p]/sum) {
				nogood = true;
				break;
			}
		}
	}
	// normalize wave heights so that
	// the sum is always between [0,1]
	var hmax = height[0];
	for (var n = 1; n < nvecs; n++) {
		if (height[n] > hmax) hmax = height[n];
	}
	for (var n = 0; n < nvecs; n++) {
		height[n] /= (hmax * 2);
	}

	// fill in waves 
	var max = 500;
	var val, dot, ind;
	// fill in wave heights [0,1)
	for (var i = 0; i < max; i++) {
		for (var j = 0; j < max; j++) {
			w0[j+max*i] = 0;
		}
	}

	for (var n = 0; n < nvecs; n++) {
		// random offset
		var ox = 10.0*Math.random() - 5.0;
		var oy = 10.0*Math.random() - 5.0;

		for (var i = 0; i < max; i++) {
			for (var j = 0; j < max; j++) {
				ind = j+max*i;
				dot = Math.cos(theta[n])*(i+ox) + Math.sin(theta[n])*(j+oy);
				val = height[n]*0.5*(Math.sin(2*Math.PI/lambda[n] * dot)+1.0);
				w0[ind] += val;
			}
		}
	}
	
	for (var i = 0; i < max; i++) {
		for (var j = 0; j < max; j++) {
			w1[j+max*i] = w0[j+max*i];
			w2[j+max*i] = w0[j+max*i];
		}
	}

	for (var i = 0; i < max; i++) w0[max*i] = 0;
	for (var i = 0; i < max; i++) w0[max-1+max*i] = 0;
	for (var j = 0; j < max; j++) w0[j+max*(max-1)] = 0;
	for (var j = 0; j < max; j++) w0[j] = 0;
	
	var cam_x = client.camera.x;
	var cam_y = client.camera.y;
	var min = Math.min(client.map.width, client.map.height);
	var cam_w = Math.floor(min / client.camera.zoom);
	var cam_h = Math.floor(min / client.camera.zoom);
	// cell dimensions in pixels
	var cell_w = CANVAS_W / cam_w;
	var cell_h = CANVAS_H / cam_h;
	
	// overwrite 1.0 for anything not ocean
	for (var i = 0; i < max; i++) {
		var a = Math.floor(i/cell_h);
		var line = client.map.data[a];
		if(!line) continue;
		for (var j = 0; j < max; j++) {
			var b = Math.floor(j/cell_w);
			if (line.charAt(b) !== "0") {
				w0[ind] = 1.0;
				w1[ind] = 1.0;
				w2[ind] = 1.0;
			}
		}
	}
}

function waveEquation() {
	var a, b, i, j, n;
	var line;
	var ind = 0, lap1 = 0, 
	maxw = CANVAS_W - 1, 
	maxh = CANVAS_H - 1, 
	jnum = CANVAS_W, grad = 0;
	
	for (i = 1; i < maxw; i++) {
		for (j = 1; j < maxh; j++)  {
			ind = j + jnum*i;
			//Compute the 2D laplacian
			lap1 = w1[j + jnum*(i-1)] + w1[j + jnum*(i+1)]
			+ w1[ind -1 ] + w1[ind +1 ] - 4.0*w1[ind];
			// add finite diff approx to 2nd time deriv
			// to complete wave equation approx.
			// note speed = speed squared
			w0[ind] = 2*w1[ind] - w2[ind] + speed*lap1;
		}
	}
}

function advectionEquation() {
	var a, b, i, j, n;
	var line;
	var ind = 0, max = 500, jnum = 500,
	grad = 0, gradp = 0, gradm = 0,
	gradi = 0, gradj = 0;
	
	for (i = 0; i < max; i++) {
		for (j = 0; j < max; j++)  {
			ind = j + jnum*i;
			//Compute 1st order upwind spatial gradient.
			// i-dir
			gradp = -w1[ind];
			gradm = w1[ind];
			if (i > 0) gradm -= w1[j + jnum*(i-1)];
			if (i < 499) gradp += w1[j + jnum*(i+1)];
			gradi = (Math.abs(gradp) < Math.abs(gradm)) ? gradp : gradm;
			// j-dir
			gradp = -w1[ind];
			gradm = w1[ind];
			if (j > 0) gradm -= w1[ind-1];
			if (j < 499) gradp += w1[ind+1];
			gradj = (Math.abs(gradp) < Math.abs(gradm)) ? gradp : gradm;
			//else lap += w1[500*i];
			// add finite diff approx to 2nd time deriv
			// to complete wave equation approx.
			// note speed = speed squared
			w0[ind] = w1[ind] + speed*Math.sqrt(gradi*gradi+gradj*gradj);
		}
	}
}

function heightColorFunction(ht) {
	return {
		r:Math.floor(255*(1-ht)), 
		g:Math.floor(255*(1-ht)), 
		b:Math.floor(255*ht)
	};
}

var prevcamx, prevcamy;
Render.prototype.renderOcean = function() {
    if (first) {
	prevcamx = client.camera.x;
	prevcamy = client.camera.y;
		initializeOcean();
		first = false;
	}
	// shift arrays before updating w0
	w2 = w1;
	w1 = w0;
	waveEquation();
	
	var id = dom.oceanCanvas.createImageData(500,500);
	var d = id.data;

	// camera position in cells
	var cam_x = client.camera.x;
	var cam_y = client.camera.y;
	var min = Math.min(client.map.width, client.map.height);
	var cam_w = Math.floor(min / client.camera.zoom);
	var cam_h = Math.floor(min / client.camera.zoom);
	// cell dimensions in pixels
	var cell_w = CANVAS_W / cam_w;
	var cell_h = CANVAS_H / cam_h;
    var zoom = Math.floor(client.camera.zoom);

    var cx = Math.floor(cam_y/cell_h);
    var cy = Math.floor(cam_x/cell_w);

    for (var i = 0; i < CANVAS_H;) {
	var u = i + cx;
	//if (u < 0) u += CANVAS_H;
	if (u >= CANVAS_H) u -= CANVAS_H;
	var du = CANVAS_W*u;
	for (var p = 0; p < zoom; p++) {
	    for (var j = 0; j < CANVAS_W;) {
		var v = j + cx;
		if (v >= CANVAS_W) v -= CANVAS_W;
		var off = v + du;
		var value = Math.min(w0[off],1.0);
		for (var q = 0; q < zoom; q++) {
		    off = 4*(v + du);
		    d[off] = 255;
		    d[off+1] = 255;
		    d[off+2] = 255;
		    d[off+3] = Math.floor(255*value);
		    j++;
		    v++;
		    if (v >= CANVAS_W) v -= CANVAS_W;
		}
	    }
	    i++;
	    du += CANVAS_W;
	}
    }
	
	dom.oceanCanvas.putImageData(id,0,0);
}

return new Render();

});

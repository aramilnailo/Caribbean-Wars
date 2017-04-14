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
sand = new Image(), ocean = new Image(), 
grass = new Image(), port = new Image(), 
defaultCell = new Image();

arrow.src = "client/imgs/arrow.png";
ball.src = "client/imgs/ball.png";
ship.src = "client/imgs/ship.png";
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
		dom.canvas.drawImage(
			imgData.img,
			shifted_w * imgData.x, 
			shifted_h * imgData.y, 
			shifted_w * imgData.w, 
			shifted_h * imgData.h
		);
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
// Saved zoom state
var lastzoom = client.camera.zoom;
// Saved camera position
var lastcntr = {x:client.camera.x,y:client.camera.y};

Render.prototype.renderOcean = function() {

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

    if (lastzoom != client.camera.zoom || first) {
	clearOcean();
	refreshOcean();
	first = false;
	lastzoom = client.camera.zoom;
    }
    
    // Cycle saved timestep wave height arrays before updating
    // calculating current wave height (w0)
    w2 = w1;
    w1 = w0;
    waveEquation();

    putOceanData(cam_x,cam_y,cell_h,cell_w);
}

function clearOcean() {

    w0 = [];
    w1 = [];
    w2 = [];
    
    for (var i = 0; i < CANVAS_H; i++) {
	for (var j = 0; j < CANVAS_W; j++) {
	    w0.push(0.0);
	    w1.push(0.0);
	    w2.push(0.0);
	}
    }
}

// Set initial wave height using
// an arbitrary set of sinusoidal waves.
// Initial condition for wave equation.
function refreshOcean() {

    // choose initial wave vectors.
    var nvecs = 10;

    // camera position in cells
    var cam_x = client.camera.x;
    var cam_y = client.camera.y;
    // camera dimensions in cells
    var min = Math.min(client.map.width, client.map.height);
    var cam_w = Math.floor(min / client.camera.zoom);
    var cam_h = Math.floor(min / client.camera.zoom);
    var len = client.map.width < client.map.height ? min/cam_w : min/cam_h;
    // cell dimensions in pixels
    var cell_w = CANVAS_W / cam_w;
    var cell_h = CANVAS_H / cam_h;


    lastcntr.x = cam_x;
    lastcntr.y = cam_y;
    
    //console.log("theta.len="+theta.length);
    // 1 < wavenum < min/5
    // wavelen = min/wavenum,
    // so that 5 < wavelen < min (pixels)
    var minwavepix = 5;
    var wavenumx = [];
    var wavenumy = [];
    var waveht = [];

    // Random wave set
    var maxzoom = 20.0;
    for (var n = 0; n < nvecs; n++) {
	var numx = Math.floor(2*(len-minwavepix)*Math.random()) + minwavepix - len;
	wavenumx.push(numx);
	var numy = Math.floor(2*(len-minwavepix)*Math.random()) + minwavepix - len;
	wavenumy.push(numy);
	var h = (Math.random() + 0.5)/1.5;
	waveht.push(h);
    }

    // summed wave heights determines pixel color
    // normalize so that the sum is almost always between [0,1]
    //console.log("ht.len = "+ height.length);
    var factor = 0.5*len/client.camera.zoom;
    /*
    for (var n = 0; n < waveht.length; n++) {
	if (factor/wavenum[n] < minwavepix) {
	    wavenum.splice(n,1);
	    waveht.splice(n,1);
	}
    } */
    
    var hmax = -1;
    for (var n = 0; n < waveht.length; n++) {
	if (waveht[n] > hmax) hmax = waveht[n];
    }
    for (var n = 0; n < waveht.length; n++)
	waveht[n] /= (waveht.length*hmax); 

    // fill in waves 
    var val, dotx, doty, prefactor;

    factor /= 6.28318508;
    for (var n = 0; n < waveht.length; n++) {

	// k = 2pi/lambda = 2pi n/L
	valx = wavenumx[n]/factor;
	valy = wavenumy[n]/factor;
	
	for (var i = 0; i < CANVAS_H; i++) {
	    for (var j = 0; j < CANVAS_W; j++) {
		w0[j+i*CANVAS_W] += waveht[n]*(Math.sin(valx*i + valy*j)+1.0);
	    }
	}
    }
    for (var i = 0; i < CANVAS_H; i++) 
	for (var j = 0; j < CANVAS_W; j++) {
	    w1[j+CANVAS_W*i] = w0[j+CANVAS_W*i];
	    w2[j+CANVAS_W*i] = w0[j+CANVAS_W*i];
	}
    
    
    // overwrite 1.0 for anything not ocean
    var ind;
    for (var i = 0; i < CANVAS_H; i++) {
	var a = Math.floor(i/cell_h);
	var line = client.map.data[a+cam_y];
	if(!line) continue;
	for (var j = 0; j < CANVAS_W; j++) {
	    var b = Math.floor(j/cell_w);
	    var ch = line.charAt(b+cam_x);
	    if (ch === "1" || ch === "2" || ch === "3") {
		w0[ind] = 1.0;
		w1[ind] = 1.0;
		w2[ind] = 1.0;
	    }
	}
    }

}

function waveEquation() {
    var ind, i,j, im, ip, jm, jp;
    var lap1 = 0;
    // periodic.
    for (i = 0; i < CANVAS_H; i++) {
	ip = i + 1;
	if (ip === CANVAS_H) ip = 0;
	im = i - 1;
	if (im === -1) im = CANVAS_H - 1;
		
	for (j = 0; j < CANVAS_W; j++) {

	    jp = j + 1;
	    if (jp === CANVAS_W) jp = 0;
	    jm = j - 1;
	    if (jm === -1) jm = CANVAS_W - 1;
	    ind = j + CANVAS_W*i;
	    lap1 = w1[j + CANVAS_W*ip] + w1[j + CANVAS_W*im]
		+ w1[jm + CANVAS_W*i] + w1[jp + CANVAS_W*i];
	    //- 4.0 * w1[ind];
	    //    note: this term should be included in the defn
	    //    of the laplacian, but it cancels with the
	    //    time-step laplacian term (also removed) below.
	    
	    w0[ind] = 0.5*lap1 - w2[ind];
		//+ 2*w1[ind] ;
	}
    }

}

function putOceanData(cam_x, cam_y, cell_h, cell_w) {
    
    var id = dom.oceanCanvas.createImageData(CANVAS_W,CANVAS_H);
    var d = id.data;

    var low = 100;

    for (var i = 0; i < CANVAS_H; i++) {
	var u = i + Math.floor((cam_y - lastcntr.y)*cell_h);
	if (u < 0) u += CANVAS_H;
	if (u >= CANVAS_H) u -= CANVAS_H;
	for (var j = 0; j < CANVAS_W; j++) {
	    var v = j + Math.floor((cam_x - lastcntr.x)*cell_w);
	    if (v < 0) v += CANVAS_W;
	    if (v >= CANVAS_W) v -= CANVAS_W;

	    var off = v + CANVAS_W*u;
	    //if (ch !== "1" && ch !=="2" && ch !== "3") {
	    var value = Math.min(w0[off],1.0);
	    //console.log("val="+value);
	    var valsq = value*value;
	    off *= 4;
	    d[off] = Math.floor((255-low)*valsq*valsq) + low; 
	    d[off+1] = Math.floor((255-low)*value) + low; 
	    d[off+2] = 255; 
	    d[off+3] = 255;
	}
    }

    dom.oceanCanvas.putImageData(id,0,0);
}

return new Render();

});


define(["debug", "dom", "client", "alerts"], function(debug, dom, client, alerts) {
   
/**
 * Map editor class
 * 
 * Provides html event handling logic to edit/create maps.
 * 
 * @module client/MapEditor
 */
var MapEditor = function () {};

// Undo/redo stacks
var mapUndoStack=[];
var mapRedoStack=[];

var paintMove = false;
var paint = "";
var brushSize = 1;

var activeArea = null;

var paintButtons = [
	{name:"water"}, {name:"sand"},
	{name:"grass"}, {name:"port"},
	{name:"resource"}, {name:"spawn"},
	{name:"dock"}
];
var brushButtons = [
	{name:"brush1"}, {name:"brush2"},
	{name:"brush4"}, {name:"brush6"},
	{name:"brush8"}, {name:"brush10"},
	{name:"brush12"}, {name:"brush14"},
	{name:"brush16"}, {name:"brush18"},
	{name:"brush20"}
];

MapEditor.prototype.listen = function(router) {
	router.listen("undoClick", this.undo);
	router.listen("redoClick", this.redo);
	router.listen("clearClick", this.clear);
	router.listen("resizeClick", this.resize);
	
    router.listen("loadEditMapResponse", this.setEditMap);
	
	router.listen("keyPressed", this.onKeyPress);
	router.listen("mapEditorCanvasMouseDown", this.onCanvasMouseDown);
	router.listen("mapEditorCanvasMouseMove", this.onCanvasMouseMove);
	router.listen("mapEditorCanvasMouseUp", this.onCanvasMouseUp);
	router.listen("mapEditorCanvasMouseLeave", this.onCanvasMouseLeave);
};
	
MapEditor.prototype.setEditMap = function(data) {
    if(debug.client) debug.log("mapeditor: setMap()");
    if(data.err) {
        alerts.pushAlert(data.err);
	} else {
		mapUndoStack.push(copyOfMap(client.map));
		client.map = data;
		mapUndoStack=[];
		mapRedoStack=[];
		// Reset zoom
		client.camera.zoom = 1.0;
		client.camera.x = 0;
		client.camera.y = 0;
		setCameraActive();
		client.loading = false;
	}
};

MapEditor.prototype.drawEditScreen = function(event) {
	if(client.camera.moved)	{
		setCameraActive();
		client.camera.moved = false;
	}
	if(!activeArea) return;
	if(!client.map) return;
	var map = client.map.data;
	// camera position in cells
	var cam_x = client.camera.x;
	var cam_y = client.camera.y;
	// camera dimensions in cells
	var min = Math.min(client.map.width, client.map.height);
	var cam_w = Math.floor(min / client.camera.zoom);
	var cam_h = Math.floor(min / client.camera.zoom);
	// cell dimensions in pixels
	var cell_w = 500 / cam_w;
	var cell_h = 500 / cam_h;
	// active area dimensions in cells
	var x = activeArea.x,
	y = activeArea.y,
	w = activeArea.w,
	h = activeArea.h;
	// Draw active area that is inside camera
	for(var i = y; i < y + h; i++) {
		var line = map[i];
		for(var j = x; j < x + w; j++) {
			var ch, color;
			if(line) ch = line.charAt(j);
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
				case "4": // Resource -- maroon
					color = "#a52a2a";
					break;
				case "5": // Spawn point -- yellow
					color = "#ffff00";
					break;
				case "6": // Dock -- pink
					color = "#f241a5";
					break;
		    	default: // Invalid -- black
					color = "#000000";
					break;
		    }
		    dom.mapEditorCanvasContext.fillStyle = color;
		    dom.mapEditorCanvasContext.fillRect(
				(j - cam_x) * cell_w, 
				(i - cam_y) * cell_h, 
				cell_w, 
				cell_h);
		}
	}
	activeArea = null;
	// In the upper left corner, draw camera's position in world map
	dom.mapEditorCanvasContext.clearRect(500, 0, 100, 100);
	dom.mapEditorCanvasContext.strokeStyle = "#000000"; // Black
	dom.mapEditorCanvasContext.strokeRect(500, 0, 100, 100);
	var rel_x = Math.floor(100 * cam_x / client.map.width);
	var rel_y = Math.floor(100 * cam_y / client.map.height);
	var rel_w = Math.floor(100 * cam_w / client.map.width);
	var rel_h = Math.floor(100 * cam_h / client.map.height);
	dom.mapEditorCanvasContext.strokeStyle = "#ff0000"; // Red
	dom.mapEditorCanvasContext.strokeRect(500 + rel_x, 0 + rel_y, rel_w, rel_h);
	
	// Draw the buttons
	drawButtons();	
};

MapEditor.prototype.initButtons = function() {
	var i;
	for(i = 0; i < paintButtons.length; i++) {
		var b = {
			name:paintButtons[i].name,
			x:540, y:20 * i + 110, w:20, h:20,
			up:new Image(),
			down:new Image(),
			ch:"" + i,
			clicked:false
		};
		b.up.src = "client/imgs/paint-" + b.name + "-up.png";
		b.down.src = "client/imgs/paint-" + b.name + "-down.png";
		paintButtons[i] = b;
	}
	for(var j = 0; j < brushButtons.length; j++, i++) {
		var b = {
			name:brushButtons[j].name,
			x:540, y:20 * i + 110, w:20, h:20,
			up:new Image(),
			down:new Image(),
			size:parseInt(brushButtons[j].name.replace("brush", "")),
			clicked:false
		};
		b.up.src = "client/imgs/" + b.name.replace("brush", "brush-") + "-up.png";
		b.down.src = "client/imgs/" + b.name.replace("brush", "brush-") + "-down.png";
		brushButtons[j] = b;
	}
};

MapEditor.prototype.undo = function () {
	if(mapUndoStack.length > 0) {
		mapRedoStack.push(copyOfMap(client.map));
		client.map = mapUndoStack.pop();
		setCameraActive();
	} else {
		alerts.pushAlert("Undo limit reached");
	}
};

MapEditor.prototype.redo = function () {
	if(mapRedoStack.length > 0) {
		mapUndoStack.push(copyOfMap(client.map));
	    client.map = mapRedoStack.pop();
		setCameraActive();
	} else {
		alerts.pushAlert("Redo limit reached");
	}
};

MapEditor.prototype.clear = function(event) {
	mapUndoStack.push(copyOfMap(client.map));
	// Zero out the data of the new map
	var line = "";
	while(line.length < client.map.width) {
		line += "0";	
	}
	client.map.data = [];
	while(client.map.data.length < client.map.height) {
		client.map.data.push(line);
	}
	setCameraActive();
};

MapEditor.prototype.resize = function(event) {
	var lx, ly;
	lx = window.prompt("New width?", "100");
	if(lx) ly = window.prompt("New height?", "100");
	if(!lx || !ly) return;
	if (lx < 2 || ly < 2 || lx > 500 || ly > 500) {
		alerts.pushAlert("Invalid map size");
		return;
	}
    mapUndoStack.push(copyOfMap(client.map));
	mapRedoStack = [];
	var newMap = copyOfMap(client.map);
	var extra_x = lx - newMap.width;
	var extra_y = ly - newMap.height;
	// Pad any extra width with water
	if(extra_x > 0) {
	    var line = "";
	    while(line.length < extra_x) line += "0";
		for(var i in newMap.data) {
			newMap.data[i] += line;
		}
	}
	// Slice off width if lx is smaller
	newMap.width = lx;
	for(var i in newMap.data) {
		newMap.data[i] = newMap.data[i].substring(0, lx);
	}
	newMap.height = ly;
	// Pad any extra height with water
	if(extra_y > 0) {
		var line = "";
		while(line.length < newMap.width) line += "0";
		for(var i = 0; i < extra_y; i++) {
			newMap.data.push(line);
		}
	} else {
		// Slice off if ly is smaller
		for(var i = 0; i > extra_y; i--) {
			newMap.data.pop();
		}
	}
	client.map = newMap;
	// reset zoom
	client.camera.zoom = 1.0;
	client.camera.x = 0;
	client.camera.y = 0;
	setCameraActive();
};

MapEditor.prototype.onKeyPress = function (event) {
	var keycode = event.which || event.keyCode;
	if (keycode === 90 && event.ctrlKey) {
	    // Ctrl-Z; backtrack
	    MapEditor.prototype.undo();
	}
};

MapEditor.prototype.onCanvasMouseDown = function (event) {
	// Handle UI button clicks
	var clicked = clickButton(event);
	if(clicked) {
	} else {
		paintMove = true;
	    mapUndoStack.push(copyOfMap(client.map));
		mapRedoStack = [];
		MapEditor.prototype.onCanvasMouseMove(event);
	}
	drawButtons();
};

MapEditor.prototype.onCanvasMouseUp = function (event) {
	if(paintMove) paintMove = false;
};

MapEditor.prototype.onCanvasMouseLeave = function (event) {
	if(paintMove) paintMove = false;
};

MapEditor.prototype.onCanvasMouseMove = function (event) {
	if(!client.map) return;
	if (paintMove) {
		// Get the coordinates in pixels of the mouse movement
	    var rect = dom.mapEditorCanvas.getBoundingClientRect();
	    var x = event.clientX - rect.left;
	    var y = event.clientY - rect.top;
		// Coordinates in cells of the mouse movement
		// Find x * cam_w / 500, + cam_x
		var min = Math.min(client.map.width, client.map.height);
		var a = Math.round((x / 500) * Math.floor(min / client.camera.zoom)) + client.camera.x;
		var b = Math.round((y / 500) * Math.floor(min / client.camera.zoom)) + client.camera.y;
		
	    if (paint !== "") {
		    var bsq = brushSize * brushSize / 4;
		    var lim = Math.floor(brushSize / 2) + 1;

		    var pmin = a - lim;
			var qmin = b - lim;
			var pmax = a + lim;
			var qmax = b + lim;
			
		    if (pmin < 0) pmin = 0;
			if (qmin < 0) qmin = 0;
		    if (pmax >= client.map.width) pmax = client.map.width;
		    if (qmax >= client.map.height) qmax = client.map.height;
			
			for (var p = pmin; p < pmax; p++) {
				for (var q = qmin; q < qmax; q++) {
				    if ((p - a) * (p - a) + (q - b) * (q - b) < bsq) {
						var line = client.map.data[q];
						line = line.substring(0, p) + paint + 
								line.substring(p + 1);
						client.map.data[q] = line;
				    }
				}
			}
			activeArea = {x:pmin, y:qmin, w:pmax-pmin, h:qmax-qmin};
	    }
	}
};

function clickButton(event) {
	// Get the coordinates in pixels of the mouse movement
    var rect = dom.mapEditorCanvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
	for(var i in paintButtons) {
		var b = paintButtons[i];
		// Check button bounds against click coords
		if(b.x < x && b.y < y && b.x + b.w > x && b.y + b.h > y) {
			if(b.clicked) {
				// If already clicked, toggle
				b.clicked = false;
				paint = "";
			} else {
				// Find and unclick any previous paint button
				var prev = paintButtons.find(function(btn) {
					return btn.ch === paint;
				});
				if(prev) prev.clicked = false;
				// Click the current button
				b.clicked = true;
				paint = b.ch;
			}
			return true;
		}
	}
	for(var i in brushButtons) {
		var b = brushButtons[i];
		if(b.x < x && b.y < y && b.x + b.w > x && b.y + b.h > y) {
			if(b.clicked) {
				// If already clicked, toggle
				b.clicked = false;
				brushSize = 1;
			} else {
				// Find and unclick any previous paint button
				var prev = brushButtons.find(function(btn) {
					return btn.size === brushSize;
				});
				if(prev) prev.clicked = false;
				// Click the current button
				b.clicked = true;
				brushSize = b.size;
			}
			return true;
		}
	}
	return false;
};

function drawButtons() {
	// Wipe the button menu
	for(var i in paintButtons) {
		var b = paintButtons[i];
		var img = b.clicked ? b.down : b.up;
		dom.mapEditorCanvasContext.drawImage(img, b.x, b.y);
	}
	for(var i in brushButtons) {
		var b = brushButtons[i];
		var img = b.clicked ? b.down : b.up;
		dom.mapEditorCanvasContext.drawImage(img, b.x, b.y);
	}
};

function setCameraActive() {
	var min = Math.min(client.map.width, client.map.height);
	activeArea = {
			x:client.camera.x,
			y:client.camera.y,
			w:Math.floor(min / client.camera.zoom),
			h:Math.floor(min / client.camera.zoom)
	};
};

function copyOfMap(oldmap) {
	// deep copy
	return JSON.parse(JSON.stringify(oldmap));
};

return new MapEditor();

});


define(["debug", "dom", "client"], function(debug, dom, client) {
   
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
var paintingSand = false;
var paintingWater = false;
var paintingPort = false;
var paintingGrass = false;

var brushSize = 1;

var activeArea = null;

var sandicondownimg = "client/imgs/mapeditorsandicondown.png";
var sandiconupimg = "client/imgs/mapeditorsandiconup.png";
var watericondownimg = "client/imgs/mapeditorwatericondown.png";
var watericonupimg = "client/imgs/mapeditorwatericonup.png";
var grassicondownimg = "client/imgs/mapeditorgrassicondown.png";
var grassiconupimg = "client/imgs/mapeditorgrassiconup.png";
var porticondownimg = "client/imgs/mapeditorporticondown.png";
var porticonupimg = "client/imgs/mapeditorporticonup.png";

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
	
	router.listen("mapEditorBrush20Click", this.mapEditorSwitchBrush20Click);
	router.listen("mapEditorBrush18Click", this.mapEditorSwitchBrush18Click);
	router.listen("mapEditorBrush16Click", this.mapEditorSwitchBrush16Click);
	router.listen("mapEditorBrush14Click", this.mapEditorSwitchBrush14Click);
	router.listen("mapEditorBrush12Click", this.mapEditorSwitchBrush12Click);
	router.listen("mapEditorBrush10Click", this.mapEditorSwitchBrush10Click);
	router.listen("mapEditorBrush08Click", this.mapEditorSwitchBrush08Click);
	router.listen("mapEditorBrush06Click", this.mapEditorSwitchBrush06Click);
	router.listen("mapEditorBrush04Click", this.mapEditorSwitchBrush04Click);
	router.listen("mapEditorBrush02Click", this.mapEditorSwitchBrush02Click);
	router.listen("mapEditorBrush01Click", this.mapEditorSwitchBrush01Click);
	
	router.listen("mapEditorPaintSandIconClick",this.lowerSandIcon);
	router.listen("mapEditorPaintSandIconClick",this.raiseWaterIcon);
	router.listen("mapEditorPaintSandIconClick",this.raisePortIcon);
	router.listen("mapEditorPaintSandIconClick",this.raiseGrassIcon);

	router.listen("mapEditorPaintWaterIconClick",this.raiseSandIcon);
	router.listen("mapEditorPaintWaterIconClick",this.lowerWaterIcon);
	router.listen("mapEditorPaintWaterIconClick",this.raisePortIcon);
	router.listen("mapEditorPaintWaterIconClick",this.raiseGrassIcon);

	router.listen("mapEditorPaintPortIconClick",this.raiseSandIcon);
	router.listen("mapEditorPaintPortIconClick",this.raiseWaterIcon);
	router.listen("mapEditorPaintPortIconClick",this.lowerPortIcon);
	router.listen("mapEditorPaintPortIconClick",this.raiseGrassIcon);

	router.listen("mapEditorPaintGrassIconClick",this.raiseSandIcon);
	router.listen("mapEditorPaintGrassIconClick",this.raiseWaterIcon);
	router.listen("mapEditorPaintGrassIconClick",this.raisePortIcon);
	router.listen("mapEditorPaintGrassIconClick",this.lowerGrassIcon);
};
	
MapEditor.prototype.setEditMap = function(data) {
    if(debug.client) debug.log("mapeditor: setMap()");
    if(data.err) {
        alert(data.err);
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
	dom.mapEditorCanvasContext.clearRect(500, 0, 100, 500);
	dom.mapEditorCanvasContext.strokeStyle = "#000000"; // Black
	dom.mapEditorCanvasContext.strokeRect(500, 0, 100, 100);
	var rel_x = Math.floor(100 * cam_x / client.map.width);
	var rel_y = Math.floor(100 * cam_y / client.map.height);
	var rel_w = Math.floor(100 * cam_w / client.map.width);
	var rel_h = Math.floor(100 * cam_h / client.map.height);
	dom.mapEditorCanvasContext.strokeStyle = "#ff0000"; // Red
	dom.mapEditorCanvasContext.strokeRect(500 + rel_x, 0 + rel_y, rel_w, rel_h);	
};

MapEditor.prototype.undo = function () {
	if(mapUndoStack.length > 0) {
		mapRedoStack.push(copyOfMap(client.map));
		client.map = mapUndoStack.pop();
		setCameraActive();
	} else {
		alert("Undo limit reached");
	}
};

MapEditor.prototype.redo = function () {
	if(mapRedoStack.length > 0) {
		mapUndoStack.push(copyOfMap(client.map));
	    client.map = mapRedoStack.pop();
		setCameraActive();
	} else {
		alert("Redo limit reached");
	}
};

MapEditor.prototype.clear = function(event) {
	if (debug.mapeditor) debug.log("client/mapeditor.js:ClearMapButtonClick");
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
	if (debug.mapeditor) debug.log("client/mapeditor.js: mapEditorResizeSubmitButtonClick()");
	var lx, ly;
	lx = window.prompt("New width?", "100");
	if(lx) ly = window.prompt("New height?", "100");
	if(!lx || !ly) return;
	if (lx < 2 || ly < 2 || lx > 500 || ly > 500) {
		alert("Invalid map size");
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
	    MapEditor.prototype.backtrack();
	}
};

MapEditor.prototype.onCanvasMouseDown = function (event) {
	paintMove = true;
    mapUndoStack.push(copyOfMap(client.map));
	mapRedoStack = [];
	MapEditor.prototype.onCanvasMouseMove(event);
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
		// Coordinates in pixels of the mouse movement
	    var x = event.clientX - dom.mapEditorCanvas.offsetLeft;
	    var y = event.clientY - dom.mapEditorCanvas.offsetTop;
		// Coordinates in cells of the mouse movement
		// Find x * cam_w / 500, + cam_x
		var min = Math.min(client.map.width, client.map.height);
		var a = Math.round((x / 500) * Math.floor(min / client.camera.zoom)) + client.camera.x;
		var b = Math.round((y / 500) * Math.floor(min / client.camera.zoom)) + client.camera.y;
		debug.log("("+x+", "+y+")-->("+a+", "+b+")");
		
	    var change = false;
	    var ch;
	    if (paintingWater) { ch = "0"; change = true; }
	    if (paintingSand) { ch = "1"; change = true; }
	    if (paintingGrass) { ch = "2"; change = true; }
	    if (paintingPort) { ch = "3"; change = true; }

	    var bsq = brushSize * brushSize / 4;
	    var lim = Math.floor(brushSize / 2) + 1;

	    var pmin = a - lim;
	    if (pmin < 0) pmin = 0;
	    var pmax = a + lim;
	    if (pmax >= client.map.width) 
			pmax = client.map.width;

	    var qmin = b - lim;
	    if (qmin < 0) qmin = 0;
	    var qmax = b + lim;
	    if (qmax >= client.map.height) 
			qmax = client.map.height;

	    if (change) {
			var p,q;
			for (p = pmin; p < pmax; p++) {
				for (q = qmin; q < qmax; q++) {
				    if ((p-a)*(p-a)+(q-b)*(q-b) < bsq) {
						var line = client.map.data[q];
						line = line.substring(0, p) + ch + 
								line.substring(p + 1);
						client.map.data[q] = line;
				    }
				}
			}
			activeArea = {x:pmin, y:qmin, w:pmax-pmin, h:qmax-qmin};
	    }
	}
};

MapEditor.prototype.mapEditorSwitchBrush20Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush20.src="client/imgs/mapeditorbrush20down.png";
	brushSize = 20;
};

MapEditor.prototype.mapEditorSwitchBrush18Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush18.src="client/imgs/mapeditorbrush18down.png";
	brushSize = 18;
};

MapEditor.prototype.mapEditorSwitchBrush16Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush16.src="client/imgs/mapeditorbrush16down.png";
	brushSize = 16;
};

MapEditor.prototype.mapEditorSwitchBrush14Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush14.src="client/imgs/mapeditorbrush14down.png";
	brushSize = 14;
};

MapEditor.prototype.mapEditorSwitchBrush12Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush12.src="client/imgs/mapeditorbrush12down.png";
	brushSize = 12;
};

MapEditor.prototype.mapEditorSwitchBrush10Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush10.src="client/imgs/mapeditorbrush10down.png";
	brushSize = 10;
};

MapEditor.prototype.mapEditorSwitchBrush08Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush08.src="client/imgs/mapeditorbrush08down.png";
	brushSize = 8;
};

MapEditor.prototype.mapEditorSwitchBrush06Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush06.src="client/imgs/mapeditorbrush06down.png";
	brushSize = 6;
};

MapEditor.prototype.mapEditorSwitchBrush04Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush04.src="client/imgs/mapeditorbrush04down.png";
	brushSize = 4;
};

MapEditor.prototype.mapEditorSwitchBrush02Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush02.src="client/imgs/mapeditorbrush02down.png";
	brushSize = 2;
};

MapEditor.prototype.mapEditorSwitchBrush01Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush01.src="client/imgs/mapeditorbrush01down.png";
	brushSize = 1;
};

MapEditor.prototype.lowerSandIcon = function() {
	dom.mapEditorPaintSandIcon.src = sandicondownimg;
	paintingSand = true;
};

MapEditor.prototype.raiseSandIcon = function() {
	dom.mapEditorPaintSandIcon.src = sandiconupimg;
	paintingSand = false;
};

MapEditor.prototype.lowerWaterIcon = function() {
	dom.mapEditorPaintWaterIcon.src = watericondownimg;
	paintingWater = true;
};

MapEditor.prototype.raiseWaterIcon = function() {
	dom.mapEditorPaintWaterIcon.src = watericonupimg;
	paintingWater = false;
};

MapEditor.prototype.lowerGrassIcon = function() {
	dom.mapEditorPaintGrassIcon.src = grassicondownimg;
	paintingGrass = true;
};

MapEditor.prototype.raiseGrassIcon = function() {
	dom.mapEditorPaintGrassIcon.src = grassiconupimg;
	paintingGrass = false;
};

MapEditor.prototype.lowerPortIcon = function() {
	dom.mapEditorPaintPortIcon.src = porticondownimg;
	paintingPort = true;
};

MapEditor.prototype.raisePortIcon = function() {
	dom.mapEditorPaintPortIcon.src = porticonupimg;
	paintingPort = false;
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

function flipAllBrushButtonsUp() {
	dom.mapEditorBrush20.src="client/imgs/mapeditorbrush20up.png";
	dom.mapEditorBrush18.src="client/imgs/mapeditorbrush18up.png";
	dom.mapEditorBrush16.src="client/imgs/mapeditorbrush16up.png";
	dom.mapEditorBrush14.src="client/imgs/mapeditorbrush14up.png";
	dom.mapEditorBrush12.src="client/imgs/mapeditorbrush12up.png";
	dom.mapEditorBrush10.src="client/imgs/mapeditorbrush10up.png";
	dom.mapEditorBrush08.src="client/imgs/mapeditorbrush08up.png";
	dom.mapEditorBrush06.src="client/imgs/mapeditorbrush06up.png";
	dom.mapEditorBrush04.src="client/imgs/mapeditorbrush04up.png";
	dom.mapEditorBrush02.src="client/imgs/mapeditorbrush02up.png";
	dom.mapEditorBrush01.src="client/imgs/mapeditorbrush01up.png";	
};

return new MapEditor();

});

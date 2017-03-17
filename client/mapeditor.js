
define(["debug", "dom", "client", "mapeditorfiles"], function(debug, dom, client, mapeditorfiles) {
       
    /**
     * Map editor class
     * 
     * Provides html event handling logic to edit/create maps.
     * 
     * @module client/MapEditor
     */
    var MapEditor = function () {};

    var mapEditHistory=[];
    var currentMap = 0;
    var paintMove = false;
    var paintingSand = false;
    var paintingWater = false;
    var paintingPort = false;
    var paintingGrass = false;

    var dx = 50;
    var dy = 50;

    var brushSize = 1;
    
    /**
     * 
     * @memberof client/MapEditor
     */
    MapEditor.prototype.listen = function(router) {

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

	router.listen("mapEditorCanvasMouseDown",this.onCanvasMouseDown);
	router.listen("mapEditorCanvasMouseMove",this.onCanvasMouseMove);
	router.listen("mapEditorCanvasMouseUp",this.onCanvasMouseUp);
	router.listen("mapEditorCanvasMouseLeave",this.onCanvasMouseLeave);
	
	router.listen("keyPressed",this.onKeyPress);
	router.listen("refreshEditScreen",this.drawEditScreen);
	router.listen("getEditMapResponse",this.loadNewEditMap);
	router.listen("mapEditorLogoutButtonClick",this.mapEditorLogoutButtonClick);
	router.listen("mapEditorLoadMapButtonClick",this.mapEditorLoadMapButtonClick);
	router.listen("mapEditorSavedMapsListButtonClick",this.mapEditorSavedMapsListButtonClick);
	router.listen("mapEditorResizeButtonClick",this.mapEditorResizeButtonClick);
	router.listen("mapEditorResizeSubmitButtonClick",this.mapEditorResizeSubmitButtonClick);
	router.listen("mapEditorSaveMapButtonClick",this.mapEditorSaveMapButtonClick);


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
	
    }

    /**
     * Prompts the user for a file name and requests to save                                      
     * the current game (currently just the map, not an entire       
     * game object) under this file name on the server, with                                      
     * the requesting user listed as its author.
     * @memberof client/MapEditor
     */
    MapEditor.prototype.mapEditorSaveMapButtonClick = function() {
	var filename = window.prompt("Save as: ","filename");
	if(filename) {
	    var fullpath = "./assets/" + filename;
	    client.emit("saveMapRequest",
			{filename:filename, username:client.username,usertype:client.usertype, map:client.map, path:fullpath});
	}
    };

    

    /**
     * 
     * @memberof client/MapEditor
     */
    MapEditor.prototype.loadNewEditMap = function(event) {
	mapEditHistory=[];
	mapEditHistory.push(client.map);
	MapEditor.prototype.drawEditScreen(event);
	currentMap = 0;
    }
    
    /**
     * 
     * @memberof client/MapEditor
     */
    MapEditor.prototype.drawEditScreen = function(event) {
	if (debug.mapeditor) debug.log("client/mapeditor.js: drawEditScreen");
	// Clear screen
	dom.mapEditorCanvasContext.clearRect(0, 0, 500, 500);
	var ly = client.map.ly;
	var lx = client.map.lx;
	// Draw the map
	if (debug.mapeditor) debug.log("client/mapeditor.js: drawEditScreen: lx="+lx+"; ly="+ly);
	//if (debug.mapeditor) debug.log("client/mapeditor.js: drawEditScreen: dx="+dx+"; dy="+dy);
	var i, j;
        var ch, color;
	for (i = 0; i < lx; i++) {
	    for (j = 0; j < ly; j++) {
		ch = client.map.data[ly * i + j];
		switch (ch) {
		case 0 : color = "#42C5F4";
		    break;
		case 1 : color = "#C19E70";
		    break;
		case 2 : color = "#2A8C23";
		    break;
		default  : color = "#000000";
		}
		dom.mapEditorCanvasContext.fillStyle = color;
		dom.mapEditorCanvasContext.fillRect(j * dy, i * dx, 50, 50);
	    }
	}
	    
	if(debug.mapeditor) debug.log("client/mapeditor: drawEditScreen exit");
    }
    
    ////////////////////
    // Sand icon functionality
    ////////////////////
    var sandicondownimg = "client/imgs/mapeditorsandicondown.png";
    var sandiconupimg = "client/imgs/mapeditorsandiconup.png";
    /**
     *
     * @memberof client/MapEditor
     * @memberof client/MapEditor
     */
    MapEditor.prototype.lowerSandIcon = function() {
	dom.mapEditorPaintSandIcon.src = sandicondownimg;
	paintingSand = true;
    }
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.raiseSandIcon = function() {
	dom.mapEditorPaintSandIcon.src = sandiconupimg;
	paintingSand = false;
    }

    ////////////////////
    // Water icon functionality
    ////////////////////
    var watericondownimg = "client/imgs/mapeditorwatericondown.png";
    var watericonupimg = "client/imgs/mapeditorwatericonup.png";
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.lowerWaterIcon = function() {
	dom.mapEditorPaintWaterIcon.src = watericondownimg;
	paintingWater = true;
    }
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.raiseWaterIcon = function() {
	dom.mapEditorPaintWaterIcon.src = watericonupimg;
	paintingWater = false;
    }

    ////////////////////
    // Grass icon functionality
    ////////////////////
    var grassicondownimg = "client/imgs/mapeditorgrassicondown.png";
    var grassiconupimg = "client/imgs/mapeditorgrassiconup.png";
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.lowerGrassIcon = function() {
	dom.mapEditorPaintGrassIcon.src = grassicondownimg;
	paintingGrass = true;
    }
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.raiseGrassIcon = function() {
	dom.mapEditorPaintGrassIcon.src = grassiconupimg;
	paintingGrass = false;
    }

    
    ////////////////////
    // Port icon functionality
    ////////////////////
    var porticondownimg = "client/imgs/mapeditorporticondown.png";
    var porticonupimg = "client/imgs/mapeditorporticonup.png";
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.lowerPortIcon = function() {
	dom.mapEditorPaintPortIcon.src = porticondownimg;
	paintingPort = true;
    }
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.raisePortIcon = function() {
	dom.mapEditorPaintPortIcon.src = porticonupimg;
	paintingPort = false;
    }


    
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.onKeyPress = function (event) {
	var keycode = event.which || event.keyCode;
	if (keycode === 90 && event.ctrlKey) {
	    // Ctrl-Z; backtrack
	    this.backtrack();
	}
    }
    
    /** 
     * Revert to previous map version in stack
     * @memberof client/MapEditor
     */
    MapEditor.prototype.backtrack = function () {
	if (debug.mapeditor) debug.log("client/mapeditor.js: backtrack()");
	if (this.currentMap > 0) {
	    this.currentMap--;
	    client.map = mapEditHistory[currentMap];
	}
    };

    /**
     * 
     * @memberof client/MapEditor
     */
    MapEditor.prototype.zoom = function () {
	if (debug.mapeditor) debug.log("client/mapeditor.js: zoom()");
	
    };
    
    /**
     * Loads initial map editor view into index.html.
     *
     * Default map: All water.
     * @memberof client/MapEditor
     */
    MapEditor.prototype.load = function () {
	if (debug.mapeditor) debug.log("client/mapeditor.js: load()");
	this.clear();
    };
    
    /**
     * Undisplays all map editor html elements.
     * Unlistens to all associated router listeners.
     * @memberof client/MapEditor
     */
    MapEditor.prototype.clear = function () {
	if (debug.mapeditor) debug.log("client/mapeditor.js: clear()");
	/*
	dom.canvas.clearRect(0,0,500,500);
	this.mapEditHistory.length = 0;
	this.zoomLevel = 1.0;
	var newMap = {data:[]};
	newMap.data.length = 10*10;
	mapEditHistory.push(newMap);
	var i,j;
	for (i = 0; i < 10; i++) {
	    for (j = 0; j < 10; j++) {
		newMap.data[10*i + j] = 0;
		dom.canvas.fillRect(j * 50, i * 50, 50, 50);
	    }
	}
     */
    };

    /**
     *
     * @param event
     * @memberof client/MapEditor
     */
    function clearTextbox() {
	if (debug.mapeditor) debug.log("client/mapeditor.js: clearTextbox()");
	dom.mapEditorTextboxMessage.style.display="none";
	dom.mapEditorTextboxResizeForm.style.display="none";
    }


    
    /**
     *
     * @param event
     * @memberof client/MapEditor
     */
    MapEditor.prototype.mapEditorResizeButtonClick = function (event) {
	if (debug.mapeditor) debug.log("client/mapeditor.js: mapEditorResizeButtonClick()");
	clearTextbox();
	dom.mapEditorTextboxResizeForm.style.display="inline-block";
    }

    /**
     *
     * @param event
     * @memberof client/MapEditor
     */
    MapEditor.prototype.mapEditorResizeSubmitButtonClick = function(event) {
	if (debug.mapeditor) debug.log("client/mapeditor.js: mapEditorResizeSubmitButtonClick()");
	var lx = dom.mapEditorResizedLX.value;
	var ly = dom.mapEditorResizedLY.value;
	if (lx.length > 0 && ly.length > 0 && lx > 0 && ly > 0) {

	    var oldmap = client.map;
	    var map = {
		"lx":lx,
		"ly":ly,
		"path":oldmap.path,
		author:dom.loginUsername.value,
		name:"tempmap"+mapEditHistory.length,
		data:[],
		ports:[]
	    };
	    
	    var i,j;
	    //default: water.
	    for (i = 0; i<lx; i++)
		for (j = 0; j<ly; j++) {
		    map.data.push(0);
		}

	    var oldindex,index;
	    var oldsize = oldmap.lx*oldmap.ly;
	    var oldly = oldmap.ly;
	    var mx = (lx < oldmap.lx) ? lx : oldmap.lx;
	    var my = (ly < oldmap.ly) ? ly : oldmap.ly;
	    for (i = 0; i<mx; i++)
		for (j = 0; j<my; j++) {
		    oldindex = oldly*i + j;
		    index = ly*i + j;
		    map.data[index] = oldmap.data[oldindex];
		}

	    //need to deep-copy ports here.
	    client.map = map;
	    //post-processing
	    clearTextbox();
	    mapEditHistory.push(client.map);
	    MapEditor.prototype.drawEditScreen(event);
	    currentMap = mapEditHistory.length - 1;
	} else {
	    clearTextbox();
	    dom.mapEditorTextboxMessage.innerHTML = "<p>invalid map size</p>";
	}
    }
    
    /**
     *
     * @param event
     * @memberof client/MapEditor
     */
    /*
    MapEditor.prototype.mapEditorSaveMapButtonClick = function (event) {
	if (debug.mapeditor) debug.log("client/mapeditor.js: mapEditorSaveMapButtonClick()");
	
    };
      */     
    /*
      CANVAS EVENT HANDLERS
    */

    /**
     *
     * @param event
     * @memberof client/MapEditor
     */
    MapEditor.prototype.onCanvasMouseDown = function (event) {
	paintMove = true;
	MapEditor.prototype.onCanvasMouseMove(event);
    };

    /**
     *
     * @param event
     * @memberof client/MapEditor
     */
    MapEditor.prototype.onCanvasMouseUp = function (event) {
	paintMove = false;
    }

    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.onCanvasMouseLeave = function (event) {
	paintMove = false;
    }
    
    
    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.onCanvasMouseMove = function (event) {
	if (paintMove) {
	    if (debug.mapeditor) debug.log("client/mapeditor.js: onCanvasMouseMove()");
	    var rect = event.target.getBoundingClientRect();
	    var lx = client.map.lx;
	    var ly = client.map.ly;
	    var wx = rect.height;
	    var wy = rect.width;
	    var x = event.clientX - rect.left;
	    var y = event.clientY - rect.top;
	    var a = Math.floor(lx*x/wx);
	    var b = Math.floor(ly*y/wy);
	    var change = false;
	    var ch;
	    if (paintingWater) { ch = 0; change = true; }
	    if (paintingSand) { ch = 1; change = true; }
	    if (paintingGrass) { ch = 2; change = true; }
	    if (paintingPort) { ch = 3; change = true; }
	    if (debug.mapeditor) debug.log("client/mapeditor.js: change="+change+"; ch="+ch);
	    if (debug.mapeditor) debug.log("client/mapeditor.js: a,b="+a+","+b);
	    var bsq = brushSize*brushSize;
	    var lim = Math.floor(brushSize/2)+1;
	    if (change) {
		var p,q;
		for (p = a-lim; p < a+lim; p++) {
		    if (p >= 0 && p < lx) {
			for (q = b-lim; q < b+lim; q++) {
			    if (q >= 0 && q < ly) {
				if ((p-a)*(p-a)+(q-b)*(q-b) < bsq) {
				    client.map.data[ly*q+p] = ch;
				}
			    }
			}
		    }
		}
		MapEditor.prototype.drawEditScreen(event);
	    }
	}
    };
    
               

    //////////////
    //  Map file menu event handlers
    //////////////
    /**
     * 
     * @memberof client/MapEditor
     */
    MapEditor.prototype.mapEditorSavedMapsListButtonClick = function () {
	if (debug.mapeditor) debug.log("client/mapeditorfiles.js: mapEditorSavedMapsListButtonClick()");
	mapeditorfiles.toggleSavedMapsList();
    };
    
    /**
     * 
     * @memberof client/MapEditor
     */
    //MapEditor.prototype.mapEditorSavedMapListButtonClick = function () { };
    
    /**
     * 
     * @memberof client/MapEditor
     */
    /*
    MapEditor.prototype.mapEditorSaveMapButtonClick = function() {};
*/
    /**
     * Logout
     * @memberof client/MapEditor
     */
    MapEditor.prototype.mapEditorLogoutButtonClick = function() {
	dom.mapEditorScreen.style.display="none";
	dom.mapEditorSavedMapsList.style.display="none";
	dom.mapEditorSavedMapsListHidden = true;
	client.emit("logout",null);
    };

    /**
     *
     * @memberof client/MapEditor
     */
    MapEditor.prototype.mapEditorLoadMapButtonClick = function() {
	var filename = window.prompt("Load file: ","filename");
	if (filename) {
	    client.emit("getEditMap",{username:client.username,
				      usertype:client.usertype,
				      filename:filename});
	}
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
    }

    
    MapEditor.prototype.mapEditorSwitchBrush20Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush20.src="client/imgs/mapeditorbrush20down.png";
	brushSize = 20;
    }

    MapEditor.prototype.mapEditorSwitchBrush18Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush18.src="client/imgs/mapeditorbrush18down.png";
	brushSize = 18;
    }
    
    MapEditor.prototype.mapEditorSwitchBrush16Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush16.src="client/imgs/mapeditorbrush16down.png";
	brushSize = 16;
    }
    
    MapEditor.prototype.mapEditorSwitchBrush14Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush14.src="client/imgs/mapeditorbrush14down.png";
	brushSize = 14;
    }
    MapEditor.prototype.mapEditorSwitchBrush12Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush12.src="client/imgs/mapeditorbrush12down.png";
	brushSize = 12;
    }
    MapEditor.prototype.mapEditorSwitchBrush10Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush10.src="client/imgs/mapeditorbrush10down.png";
	brushSize = 10;
    }
    MapEditor.prototype.mapEditorSwitchBrush08Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush08.src="client/imgs/mapeditorbrush08down.png";
	brushSize = 8;
    }
    MapEditor.prototype.mapEditorSwitchBrush06Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush06.src="client/imgs/mapeditorbrush06down.png";
	brushSize = 6;
    }
    MapEditor.prototype.mapEditorSwitchBrush04Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush04.src="client/imgs/mapeditorbrush04down.png";
	brushSize = 4;
    }
    MapEditor.prototype.mapEditorSwitchBrush02Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush02.src="client/imgs/mapeditorbrush02down.png";
	brushSize = 2;
    }
    MapEditor.prototype.mapEditorSwitchBrush01Click = function (event) {
	flipAllBrushButtonsUp();
	dom.mapEditorBrush01.src="client/imgs/mapeditorbrush01down.png";
	brushSize = 1;
    }
    
    return new MapEditor();

});

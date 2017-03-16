define(["debug", "dom", "client", "mapeditorfiles"], function(debug, dom, client,mapeditorfiles) {
       
    /**
     * Map editor class
     * 
     * Provides html event handling logic to edit/create maps.
     * 
     */
    var MapEditor = function () {};

    var mapEditHistor=[];
    var currentMap = 0;
    var paintMove = false;
    var paintingSand = false;
    var paintingWater = false;
    var paintingPort = false;
    var paintingGrass = false;

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
	
    }

    /**
     * Prompts the user for a file name and requests to save                                      
     * the current game (currently just the map, not an entire       
     * game object) under this file name on the server, with                                      
     * the requesting user listed as its author.
     */
    MapEditorFiles.prototype.saveMapClick = function() {
	var filename = window.prompt("Save as: ","filename");
	if(filename) {
	    var fullpath = "./assets/" + filename;
	    client.emit("saveMapRequest",
			{file_name:filename, author:dom.loginUsername,path:fullpath});
	}
    }
    

    MapEditor.prototype.loadNewEditMap = function(event) {
	mapEditHistory=[];
	mapEditHistory.push(client.map);
	MapEditor.prototype.drawEditScreen(event);
	currentMap = 0;
    }
    
    MapEditor.prototype.drawEditScreen = function(event) {
	if (debug.mapeditor) debug.log("client/mapeditor.js: drawEditScreen");
	// Clear screen
	dom.mapEditorCanvasContext.clearRect(0, 0, 500, 500);
	var ly = client.map.ly;
	var lx = client.map.lx;
	// Draw the map
	if (debug.mapeditor) debug.log("client/mapeditor.js: drawEditScreen;: lx="+lx+"; ly="+ly);

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
		dom.mapEditorCanvasContext.fillRect(j * 50, i * 50, 50, 50);
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
     */
    MapEditor.prototype.lowerSandIcon = function() {
	dom.mapEditorPaintSandIcon.src = sandicondownimg;
	paintingSand = true;
    }
    /**
     *
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
     */
    MapEditor.prototype.lowerWaterIcon = function() {
	dom.mapEditorPaintWaterIcon.src = watericondownimg;
	paintingWater = true;
    }
    /**
     *
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
     */
    MapEditor.prototype.lowerGrassIcon = function() {
	dom.mapEditorPaintGrassIcon.src = grassicondownimg;
	paintingGrass = true;
    }
    /**
     *
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
     */
    MapEditor.prototype.lowerPortIcon = function() {
	dom.mapEditorPaintPortIcon.src = porticondownimg;
	paintingPort = true;
    }
    /**
     *
     */
    MapEditor.prototype.raisePortIcon = function() {
	dom.mapEditorPaintPortIcon.src = porticonupimg;
	paintingPort = false;
    }


    
    /**
     *
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
     */ 
    MapEditor.prototype.backtrack = function () {
	if (debug.mapeditor) debug.log("client/mapeditor.js: backtrack()");
	if (this.currentMap > 0) {
	    this.currentMap--;
	    client.map = mapEditHistory[currentMap];
	}
    };

    MapEditor.prototype.zoom = function () {
	if (debug.mapeditor) debug.log("client/mapeditor.js: zoom()");
	
    };
    
    /**
     * Loads initial map editor view into index.html.
     *
     * Default map: All water.
     */
    MapEditor.prototype.load = function () {
	if (debug.mapeditor) debug.log("client/mapeditor.js: load()");
	this.clear();
    };
    
    /**
     * Undisplays all map editor html elements.
     * Unlistens to all associated router listeners.
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
     */
    MapEditor.prototype.mapEditorSaveMapButtonClick = function (event) {
	if (debug.mapeditor) debug.log("client/mapeditor.js: mapEditorSaveMapButtonClick()");
	
    };
           
    /*
      CANVAS EVENT HANDLERS
    */

    MapEditor.prototype.onCanvasMouseDown = function (event) {
	paintMove = true;
	MapEditor.prototype.onCanvasMouseMove(event);
    };

    MapEditor.prototype.onCanvasMouseUp = function (event) {
	paintMove = false;
    }

    MapEditor.prototype.onCanvasMouseLeave = function (event) {
	paintMove = false;
    }
    
    
    MapEditor.prototype.onCanvasMouseMove = function (event) {
	if (paintMove) {
	    if (debug.mapeditor) debug.log("client/mapeditor.js: onCanvasMouseMove()");
	    var rect = event.target.getBoundingClientRect();
	    var lx = client.map.lx;
	    var ly = client.map.ly;
	    var dx = client.map.dx;
	    var dy = client.map.dy;
	    var x = event.clientX - rect.left;
	    var y = event.clientY - rect.top;
	    var a = Math.floor(dx*x/lx);
	    var b = Math.floor(dy*y/ly);
	    var change = false;
	    var ch;
	    if (paintingWater) { ch = 0; change = true; }
	    if (paintingSand) { ch = 1; change = true; }
	    if (paintingGrass) { ch = 2; change = true; }
	    if (paintingPort) { ch = 3; change = true; }
	    if (debug.mapeditor) debug.log("client/mapeditor.js: change="+change+"; ch="+ch);
	    if (change) {
		client.map.data[client.map.lx*b+a] = ch;
		MapEditor.prototype.drawEditScreen(event);
	    }
	}
    };
    
               

    //////////////
    //  Map file menu event handlers
    //////////////
    /**
     * 
     */
    MapEditor.prototype.mapEditorSavedMapsListButtonClick = function () {
	if (debug.mapeditor) debug.log("client/mapeditorfiles.js: mapEditorSavedMapsListButtonClick()");
	mapeditorfiles.toggleSavedMapsList();
    };
    
    /**
     * 
     */
    MapEditor.prototype.mapEditorSavedMapListButtonClick = function () { };
    
    /**
     * 
     */
    MapEditor.prototype.mapEditorSaveMapButtonClick = function() {};

    /**
     * Logout
     */
    MapEditor.prototype.mapEditorLogoutButtonClick = function() {
	dom.mapEditorScreen.style.display="none";
	dom.mapEditorSavedMapsList.style.display="none";
	dom.mapEditorSavedMapsListHidden = true;
	client.emit("logout",null);
    };

    MapEditor.prototype.mapEditorLoadMapButtonClick = function() {
	var filename = window.prompt("Load file: ","filename");
	if (filename) {
	    client.emit("getEditMap",{username:client.username,
				      usertype:client.usertype,
				      filename:filename});
	}
    };


    
    return new MapEditor();

});

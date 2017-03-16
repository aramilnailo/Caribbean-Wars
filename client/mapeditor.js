    /*
      users: map editor
      
      ===== REQUIRES:
      map class
      access to database
      
      
      ===== PROVIDES:
      all html for map editor view
      
      default map (all water?) 
      botton: toggle load stored game/map list
      list: clickable list of all stored game/maps available to load
      
      onmousedown: paint current map element at current mouse location
      
      mouse-controlled map editing tools: 
      mutual exclusive operations:
      paint land, paint port, paint water, rotate, translate
      Select current tool via clickable icon list
      All tools operate on mousedrag in map canvas 
      + paint on mousedown, mouseclick
      
      undo map edit: C-Z
      
      button: save map / save as
      
    */


define(["debug", "dom", "client", "mapeditorfiles"], function(debug, dom, client,mapeditorfiles) {
       
    /**
     * Map editor class
     * 
     * Provides html event handling logic to edit/create maps.
     * 
     */
    var MapEditor = function () {
	/*
	var mapeditor = {

	    //// Stack that stores map objects for Ctrl-Z reversion 
	    mapEditHistory:[],
	    
	    // Current map index 
	    currentMap:0,
	    
	    // editor states
	    paintingSand:false,
	    paintingWater:false,
	    paintingPort:false,
	    paintingGrass:false,

	    zoomLevel:1.0
	}
	// need to test mapData here, and load default.
	
	mapeditor.mapEditHistory.push(client.map);
    return mapeditor;
	*/
    };


    /*
    MapEditor.prototype.mapEditHistory=[];
    // Current map index 
    MapEditor.prototype.currentMap = 0;
    // editor states
    MapEditor.prototype.paintingSand = false;
    MapEditor.prototype.paintingWater = false;
    MapEditor.prototype.paintingPort = false;
    MapEditor.prototype.paintingGrass= false;

    MapEditor.prototype.zoomLevel = 1.0
    */
    var mapEditHistor=[];
    var currentMap = 0;
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
	//router.listen("mapEditorCanvasClick",this.onCanvasClick);
	router.listen("mapEditorCanvasMouseMove",this.onCanvasMouseMove);
	
	router.listen("keyPressed",this.onKeyPress);
	//router.listen("keyReleased",this.onKeyReleased) ?
	router.listen("refreshEditScreen",this.drawEditScreen);
	router.listen("getEditMapResponse",this.loadNewEditMap);
	router.listen("mapEditorLogoutButtonClick",this.mapEditorLogoutButtonClick);
	router.listen("mapEditorLoadMapButtonClick",this.mapEditorLoadMapButtonClick);
	router.listen("mapEditorSavedMapsListButtonClick",this.mapEditorSavedMapsListButtonClick);
    }


    MapEditor.prototype.saveMap = function(event) {
	var filename = window.prompt("Save as:","filename");
	if (filename) {
	    client.emit("saveEditMapRequest",{filename:filename,author:username});
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
		//if (debug.mapeditor) debug.log("ch= "+ch);
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
		if(color == "#000000") debug.log("i,j="+i+","+j);
	    }
	}
	
/*	
	for(i = 0; i < lx; i++) {
	    for(j = 0; j < ly; j++) {
		// 0 = blue, 1 = tan, 2 = green
		ch = client.map.data[ly * i + j]; // Current cell
		dom.mapEditorCanvasContext.fillStyle = (ch == "0") ? "#42C5F4" :
		    (ch == "1") ? "#C19E70" : "#2A8C23";
		dom.mapEditorCanvasContext.fillRect(j * 50, i * 50, 50, 50);
	    }
*/
    
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
    MapEditor.prototype.toggleMapFileMenu = function() {
	if (debug.mapeditor) debug.log("client/mapeditor.js: toggleMapFileMenu()");
	if (dom.mapEditorFileMenuHidden) {
	    client.emit("mapEditorFileMenuRequest",null);
	    dom.mapEditorFileMenu.style.display = "...";
	    //dom.mapEditorMenuButton.innerHTML = "";
	    dom.mapEditorFileMenuHidden = false;
	} else {
	    //dom.mapEditorMenuButton.innerHTML = "";
	    dom.mapEditorFileMenu.style.display = "none";
	    dom.mapEditorFileMenuHidden = true;
	}
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
	if (debug.mapeditor) debug.log("client/mapeditor.js: onCanvasMouseDown()");
	var rect = event.target.getBoundingClientRect();
	var x = event.clientX - rect.left;
	var y = event.clientY - rect.top;
	if (debug.mapeditor) debug.log("client/mapeditor.js: x,y="+x+","+y);
	var a = Math.floor(1.0/500.0*client.map.ly*x);
	var b = Math.floor(1.0/500.0*client.map.lx*y);
	if (debug.mapeditor) debug.log("client/mapeditor.js: a,b="+a+","+b);
	if (debug.mapeditor) debug.log("client/mapeditor.js: flags: water="+paintingWater+",sand="+paintingSand+",port="+paintingPort+",grass="+paintingGrass);
	//var win = event.view;
	var change = false;
	var ch;
	if (paintingWater) { ch = 0; change = true; }
	if (paintingSand) { ch = 1; change = true; }
	if (paintingGrass) { ch = 2; change = true; }
	if (paintingPort) { ch = 3; change = true; }
	if (debug.mapeditor) debug.log("client/mapeditor.js: change="+change+"; ch="+ch);
	if (change) {
	    //client.map.set(a,b,ch);
	    client.map.data[client.map.lx*b+a] = ch;
	    MapEditor.prototype.drawEditScreen(event);
	}
    };
     
    /*
    MapEditor.prototype.onCanvasClick = function (event) {
	if (debug.mapeditor) debug.log("client/mapeditor.js: onCanvasClick()");
	var x = event.clientX;
	var y = event.clientY;
	var a = floor(x/client.map.lx);
	var b = floor(y/client.map.ly);
	var win = event.view;
	var change = false;
	var ch;
	if (paintingWater) { ch = 0; change = true; }
	if (paintingSand) { ch = 1; change = true; }
	if (paintingGrass) { ch = 2; change = true; }
	if (paintingPort) { ch = 3; change = true; }
	if (change) {
	    var map = mapEditHistory[currentMap].copy();
	    map.set(a,b,ch);
	    //mapEditHistory.push(map);
	    //currentMap++;
	    drawEditScreen();
	}
    };

*/

    
    MapEditor.prototype.onCanvasMouseMove = function (event) {
	//this.onCanvasMouseDown(event);
    };
    
           
    /**
     * 
     * Supported items: 
     * 
     * Save 
     * Save as
     * New
     * Load
     */
    var mapFileMenu = function () {};
    
    /**
     * 
     */
    var mapFileMenu = function () {};
    

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

    //////////////
    //  Map editor canvas event handlers
    //////////////
    /**
     * 
     */
    MapEditor.prototype.mapEditorCanvasMouseDown = function (event) {
	var x = event.clientX;
	var y = event.clientY;
    };
    
    /**
     * 
     */
    MapEditor.prototype.mapEditorCanvasMouseUp = function(event) {
	var x = event.clientX;
	var y = event.clientY;
    };
    
    /**
     * 
     */
    MapEditor.prototype.mapEditorCanvasMouseMove = function(event) {
	var x = event.clientX;
	var y = event.clientY;
    };
    
    /**
     * Toggle painting sand on the current map.
     */
    MapEditor.prototype.mapEditorPaintSandIconClick = function() {};

    /**
     * Toggle painting water on the current map.
     */
    MapEditor.prototype.mapEditorPaintWaterIconClick = function() {
    };

    /**
     * Toggle painting ports on the current map.
     */
    MapEditor.prototype.mapEditorPaintPortIconClick = function() {};

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

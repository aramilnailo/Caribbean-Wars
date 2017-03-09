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


define(["debug", "dom", "client"], function(debug, dom, client) {
       
    /**
     * Map editor class
     * 
     * Provides html event handling logic to edit/create maps.
     * 
     */
    var MapEditor = function () {
	var mapeditor = {

	    /** Stack that stores map objects for Ctrl-Z reversion */
	    mapEditHistory:[],
	    
	    /** Current map index */
	    currentMap:0,
	    
	    // editor states
	    paintingLand:false,
	    paintingWater:false,
	    paintingPort:false,
	    paintingWoods:false,

	    zoomLevel:1.0
	}
	// need to test mapData here, and load default.
	
	mapEditHistory.push(client.map);
	return mapeditor;
    };


    MapEditor.prototype.listen = function(router) {
	
	router.listen("mapEditorPaintSandIconClick",this.lowerSandIcon);
	router.listen("mapEditorPaintSandIconClick",this.raiseWaterIcon);
	router.listen("mapEditorPaintSandIconClick",this.raisePortIcon);
	router.listen("mapEditorPaintSandIconClick",this.raiseWoodsIcon);
	
	router.listen("mapEditorPaintWaterIconClick",this.raiseSandIcon);
	router.listen("mapEditorPaintWaterIconClick",this.lowerWaterIcon);
	router.listen("mapEditorPaintWaterIconClick",this.raisePortIcon);
	router.listen("mapEditorPaintWaterIconClick",this.raiseWoodsIcon);

	router.listen("mapEditorPaintPortIconClick",this.raiseSandIcon);
	router.listen("mapEditorPaintPortIconClick",this.raiseWaterIcon);
	router.listen("mapEditorPaintPortIconClick",this.lowerPortIcon);
	router.listen("mapEditorPaintPortIconClick",this.raiseWoodsIcon);

	router.listen("mapEditorPaintWoodsIconClick",this.raiseSandIcon);
	router.listen("mapEditorPaintWoodsIconClick",this.raiseWaterIcon);
	router.listen("mapEditorPaintWoodsIconClick",this.raisePortIcon);
	router.listen("mapEditorPaintWoodsIconClick",this.lowerWoodsIcon);

	router.listen("mapEditorCanvasMouseDown",this.onCanvasMouseDown);
	router.listen("mapEditorCanvasMouseMove",this.onCanvasMouseMove);
	
	router.listen("keyPressed",this.onKeyPress);
	//router.listen("keyReleased",this.onKeyReleased) ?	
    }

    ////////////////////
    // Land icon functionality
    ////////////////////
    MapEditor.prototype.landicondownimg = "assets/mapeditorlandicondown.png";
    MapEditor.prototype.landiconupimg = "assets/mapeditorlandiconup.png";
    /**
     *
     */
    MapEditor.prototype.lowerLandIcon = function() {
	dom.mapEditorPaintLandIcon.img = this.landicondownimg;
	this.paintingLand = true;
    }
    /**
     *
     */
    MapEditor.prototype.raiseLandIcon = function() {
	dom.mapEditorPaintLandIcon.img = this.landiconupimg;
	this.paintingLand = false;
    }

    ////////////////////
    // Water icon functionality
    ////////////////////
    MapEditor.prototype.watericondownimg = "assets/mapeditorwatericondown.png";
    MapEditor.prototype.watericonupimg = "assets/mapeditorwatericonup.png";
    /**
     *
     */
    MapEditor.prototype.lowerWaterIcon = function() {
	dom.mapEditorPaintWaterIcon.img = this.watericondownimg;
	this.paintingWater = true;
    }
    /**
     *
     */
    MapEditor.prototype.raiseWaterIcon = function() {
	dom.mapEditorPaintWaterIcon.img = this.watericonupimg;
	this.paintingWater = false;
    }

    ////////////////////
    // Woods icon functionality
    ////////////////////
    MapEditor.prototype.woodsicondownimg = "assets/mapeditorwoodsicondown.png";
    MapEditor.prototype.woodsiconupimg = "assets/mapeditorwoodsiconup.png";
    /**
     *
     */
    MapEditor.prototype.lowerWoodsIcon = function() {
	dom.mapEditorPaintWoodsIcon.img = this.woodsicondownimg;
	this.paintingWoods = true;
    }
    /**
     *
     */
    MapEditor.prototype.raiseWoodsIcon = function() {
	dom.mapEditorPaintWoodsIcon.img = this.woodsiconupimg;
	this.paintingWoods = false;
    }

    
    ////////////////////
    // Port icon functionality
    ////////////////////
    MapEditor.prototype.porticondownimg = "assets/mapeditorporticondown.png";
    MapEditor.prototype.porticonupimg = "assets/mapeditorporticonup.png";
    /**
     *
     */
    MapEditor.prototype.lowerPortIcon = function() {
	dom.mapEditorPaintPortIcon.img = this.porticondownimg;
	this.paintingPort = true;
    }
    /**
     *
     */
    MapEditor.prototype.raisePortIcon = function() {
	dom.mapEditorPaintPortIcon.img = this.porticonupimg;
	this.paintingPort = false;
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
	if (this.currentMap > 0) {
	    this.currentMap--;
	    client.mapData = mapEditHistory[currentMap];
	}
    };

    MapEditor.prototype.zoom = function () {
	
    };
    
    /**
     * Loads initial map editor view into index.html.
     *
     * Default map: All water.
     */
    MapEditor.prototype.load = function () {
	this.clear();
    };
    
    /**
     * Undisplays all map editor html elements.
     * Unlistens to all associated router listeners.
     */
    MapEditor.prototype.clear = function () {
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
    };
    
    /**
     * 
     */
    MapEditor.prototype.toggleMapFileMenu = function() {
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
    MapEditor.prototype.displayMapFileMenu = function () {

    }
    
    /**
     *
     */
    savedMapListButton.onclick = function () {};
    
    /**
     *
     */
    logoutButton.onclick = function () {
	this.clear();
    }
       
    /*
      CANVAS EVENT HANDLERS
    */

    MapEditor.prototype.onCanvasMouseDown = function (event) {
	var x = event.clientX;
	var y = event.clientY;
	var win = event.view;
	var change = false;
	var ch;
	if (paintingWater) { ch = 0; change = true; }
	if (paintingLand) { ch = 1; change = true; }
	if (paintingWoods) { ch = 2; change = true; }
	if (paintingPort) { ch = 3; change = true; }
	if (change) {
	    var map = mapEditHistory[currentMap].copy();
	    currentMap++;
	    mapEditHistory.push(map);
	    map.charAt(a,b) = ch;
	}
    };
    
    MapEditor.prototype.onCanvasMouseMove = function (event) {
	this.onCanvasMouseDown(event);
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
    MapEditor.prototype.mapEditorSavedMapListButtonClick = function () { };
    /**
     * 
     */
    MapEditor.prototype.mapEditorSavedMapListButtonClick = function () { };
    /**
     * 
     */
    MapEditor.prototype.mapEditorSaveMapButton = function() {};

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
    MapEditor.prototype.mapEditorCanvas.mapEditorCanvasMouseMove = function(event) {
	var x = event.clientX;
	var y = event.clientY;
    };
    /**
     * Toggle painting land on the current map.
     */
    MapEditor.prototype.mapEditorPaintLandIcon.mapEditorPaintLandIconClick = function() {};

    /**
     * Toggle painting water on the current map.
     */
    MapEditor.prototype.mapEditorPaintWaterIcon.mapEditorPaintWaterIconClick = function() {
    };

    /**
     * Toggle painting ports on the current map.
     */
    MapEditor.prototype.mapEditorPaintPortIcon.mapEditorPaintPortIconClick = function() {};
    
   

});

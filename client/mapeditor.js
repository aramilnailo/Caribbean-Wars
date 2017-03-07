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


define(["debug", "dom", "client", "mapeditoricon"], function(debug, dom, client,mapeditoricon) {

    
    // MapEditor window elements in dom.js
    /*
    mapEditorSavedMapListButton:document.getElementById("map-editor-saved-maps-btn"),
    mapEditorSavedMapList:document.getElementById("map-editor-saved-maps-list"),
    mapEditorCanvas:document.getElementById("map-editor-canvas"),
    mapEditorPaintLandIcon:document.getElementById("map-editor-paint-land-img"),
    mapEditorPaintWaterIcon:document.getElementById("map-editor-paint-water-img"),
    mapEditorPaintPortIcon:document.getElementById("map-editor-paint-port-img"),
    mapEditorLogoutButton:document.getElementById("map-editor-logout-btn"),
    mapEditorFileDropDownList:document.getElementById("map-editor-file-menu"),
    mapEditorSaveMapButton:document.getElementById("save-map-btn");
    mapEditorFileMenuHidden:true,
*/
    
    /**
     * Map editor view class
     * 
     * Provides html logic to edit/create maps.
     * 
     */
    var MapEditor = function () {
	var mapeditor = {
	    /** Current map */ currentMap:null,

	    /** Stack that stores map objects for cntl-Z reversion */
	    mapEditHistory:[],

	    // editor states
	    paintingLand:false,
	    paintingWater:false,
	    paintingPort:false,

	    /** @private Variable set by clicking the icon array
	     * "none", "paintland", "paintwater", "paintport", "rotatemap", "translatemap"
	     */
	    currentPaintTool:"none",
	    zoomLevel:1.0
	}

	mapeditor.watericon.upimg = "assets/mapeditorwatericonup.png";
	mapeditor.watericon.downimg = "assets/mapeditorwatericondown.png";
	mapeditor.porticon.upimg = "assets/mapeditorporticonup.png";
	mapeditor.porticon.downimg = "assets/mapeditorporticondown.png";
	
	return mapeditor;
    };

    MapEditor.prototype.landicon = new MapEditorIcon("land");
    MapEditor.prototype.landicon.upimg = "assets/mapeditorlandiconup.png";
    MapEditor.prototype.landicon.downimg = "assets/mapeditorlandicondown.png";

    MapEditor.prototype.watericon = new MapEditorIcon("water");
    MapEditor.prototype.watericon.upimg = "assets/mapeditorwatericonup.png";
    MapEditor.prototype.watericon.downimg = "assets/mapeditorwatericondown.png";

    MapEditor.prototype.porticon = new MapEditorIcon("port");
    MapEditor.prototype.portcon.upimg = "assets/mapeditorporticonup.png";
    MapEditor.prototype.porticon.downimg = "assets/mapeditorporticondown.png";


    MapEditor.prototype.listen = function(router) {
	
	router.listen("mapEditorPaintLandIconClick",this.landicon.down);
	router.listen("mapEditorPaintLandIconClick",this.watericon.up);
	router.listen("mapEditorPaintLandIconClick",this.porticon.up);
	
	router.listen("mapEditorPaintWaterIconClick",this.landicon.up);
	router.listen("mapEditorPaintWaterIconClick",this.watericon.down);
	router.listen("mapEditorPaintWaterIconClick",this.porticon.up);

	router.listen("mapEditorPaintPortIconClick",this.landicon.up);
	router.listen("mapEditorPaintPortIconClick",this.watericon.up);
	router.listen("mapEditorPaintPortIconClick",this.porticon.down);
	
    }

    
    /** 
     * Revert to previous map version in stack
     */ 
    MapEditor.prototype.backtrack = function (event) {
	if (event.ctrlKey) {
	    
	};
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

    // action depends on selected tool
    mapCanvas.onmousedown = function(event) {
	var x = event.clientX;
	var y = event.clientY;
	var win = event.view;
    };
    mapCanvas.onmouseup = function(event) {
	var x = event.clientX;
	var y = event.clientY;
	var win = event.view;

    };
    mapCanvas.onmousemove = function(event) {
	var x = event.clientX;
	var y = event.clientY;
	var win = event.view;

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

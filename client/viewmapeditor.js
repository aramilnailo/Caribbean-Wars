define(["debug", "dom", "client"], function(debug, dom, client) {

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
    
    /**
     * Map editor view class
     * 
     * Provides html logic to edit/create maps.
     * 
     */
    var ViewMapEditor = function () {};

    /** Current map */
    ViewMapEditor.prototype.currentMap = null;
    /** Stack that stores map objects for cntl-Z reversion */
    VieMapEditor.prototype.editHistory = [];

    /** 
     * Revert to previous map version in stack
     */ 
    ViewMapEditor.prototype.backtrack = function (event) {
	if (event.ctrlKey) {};
    }

    /** 
     * Variable set by clicking the icon array
     * "none", "paintland", "paintwater", "paintport", "rotatemap", "translatemap"
     */
    ViewMapEditor.paintTool = "none";

    // HTML elements. Move to dom.js
    var savedMapListButton = document.getElementById("saved-maps-btn");
    var savedMapList = document.getElementById("saved-maps-list");
    var mapCanvas = document.getElementById("map-canvas");

    var paintLandIcon = document.getElementById("paint-land-img");
    var paintWaterIcon = document.getElementById("paint-water-img");
    var paintPortIcon = document.getElementById("paint-port-img");
    var logoutButton = document.getElementById("logout-btn");
    
    var mapFileDropDownList = document.getElementById("file-menu");
    
    var saveMapButton = document.getElementById("save-map-btn");


    /**
     * Loads initial map editor view into index.html.
     *
     * Default map: All water.
     */
    ViewMapEditor.prototype.load = function () {};
    
    /**
     * Clears index.html of all map editor elements.
     *
     * Unlistens all associated router listeners.
     */
    ViewMapEditor.prototype.clear = function () {};
    
    /**
     *
     */
    savedMapListButton.onclick = function () {};
    
    /**
     *
     */
    logoutButton.onclick = function () {
	this.clear();
	
    };
    
    
    /**
     *
     */
    ViewMapEditor.mousePainting = "off";
    
/*
  CANVAS EVENT HANDLERS
*/

    // action depends on selected tool
    mapCanvas.onmousedown = function(event) {
	var x = event.clientX;
	var y = event.clientY;
	var win = event.view;
    };

    /**
     *
     */
    mapCanvas.onmouseup = function(event) {
	var x = event.clientX;
	var y = event.clientY;
	var win = event.view;

    };
    
    /**
     *
     */
    mapCanvas.onmousemove = function(event) {
	var x = event.clientX;
	var y = event.clientY;
	var win = event.view;

    };
    

    /*
      TOOL ICON MENU HANDLERS
    */

    // set all icon images to unpressed version
    // if tooltip = land, set pressed land icon image
    /**
     *
     */
    paintLandIcon.onclick = function() {
	var x = event.clientX;
	var y = event.clientY;
    };
    
    // set all icon images to unpressed version
    // if tooltip = land, set pressed land icon image
    /**
     *
     */
    paintWaterIcon.onclick = function() {
    };
    
    // set all icon images to unpressed version
    // if tooltip = land, set pressed land icon image
    /**
     *
     */
    paintPortIcon.onclick = function() {

    };
    
    // set all icon images to unpressed version
    // if tooltip = land, set pressed land icon image
    /**
     *
     */
    paintRotateIcon.onclick = function() {
    };
    
    // set all icon images to unpressed version
    // if tooltip = land, set pressed land icon image
    /**
     *
     */
    paintTranslateIcon.onclick = function() {};
    
    /**
     * Saves the current map.
     * If not saved, will ask for file name.
     */
    // mouseout, mouseup the same function (pressed img-> unpressed)
    mapSaveIcon.mousedown = function() {};
    mapSaveIcon.mouseup = function() {};
    mapSaveIcon.mouseout = mapSaveIcon.mouseup;
    
    /**
     * Loads drop-down file menu
     */
    mapFileMenuIcon.onclick = function() {};
    
    /**
     * 
     */
    var toggleMapFileMenu = function() {};
    
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
    






});

define(["router"], function(router) {

var dom = {
	// Document
	document:document,

	// Login page
	loginScreen:document.getElementById("login-screen"),
        loginUsername:document.getElementById("login-username"),
        loginUsertype:{},
    	loginUsertypeForm:document.getElementById("login-usertype-radiobox"),
	loginPassword:document.getElementById("login-password"),
	loginButton:document.getElementById("login-btn"),
	signupButton:document.getElementById("signup-btn"),

	// User list
	userListButton:document.getElementById("user-list-btn"),
	userList:document.getElementById("user-list"),

	// Game screen
	gameScreen:document.getElementById("game-screen"),
	canvas:document.getElementById("canvas").getContext("2d"),

	// Upper game menu
        usernameLabel:document.getElementById("username-label"),
    	usertypeLabel:document.getElementById("usertype-label"),
	logoutButton:document.getElementById("logout-btn"),
	deleteAccountButton:document.getElementById("delete-account-btn"),

	// Save game menu
	savedGamesMenuButton:document.getElementById("saved-games-menu-btn"),
	loadGameButton:document.getElementById("load-game-btn"),
	saveGameButton:document.getElementById("save-game-btn"),
	deleteGameButton:document.getElementById("delete-game-btn"),
	savedGamesMenu:document.getElementById("saved-games-menu"),
	savedGamesList:document.getElementById("saved-games-list"),

	// Stats menu
	statsMenu:document.getElementById("stats-menu"),
	statsMenuButton:document.getElementById("stats-menu-btn"),
	clearStatsButton:document.getElementById("clear-stats-btn"),

	// Chat window
	chatWindow:document.getElementById("chat-window"),
	chatLog:document.getElementById("chat-log"),
	chatForm:document.getElementById("chat-form"),
	chatInput:document.getElementById("chat-input"),
	chatSubmitButton:document.getElementById("chat-submit-btn"),
        chatToggleButton:document.getElementById("chat-toggle-btn"),

    // MapEditor window
    mapEditorScreen:document.getElementById("map-editor-screen"),
    mapEditorSavedMapsListButton:document.getElementById("map-editor-saved-maps-btn"),
    mapEditorSavedMapsList:document.getElementById("map-editor-saved-maps-list"),
    mapEditorCanvas:document.getElementById("map-editor-canvas").getContext("2d"),
    mapEditorIconPanel:document.getElementById("map-editor-icon-panel"),
    mapEditorPaintLandIcon:document.getElementById("map-editor-paint-land-img"),
    mapEditorPaintWoodsIcon:document.getElementById("map-editor-paint-woods-img"),
    mapEditorPaintWaterIcon:document.getElementById("map-editor-paint-water-img"),
    mapEditorPaintPortIcon:document.getElementById("map-editor-paint-port-img"),
    mapEditorLogoutButton:document.getElementById("map-editor-logout-btn"),
    mapEditorFileDropDownList:document.getElementById("map-editor-file-menu"),
    mapEditorSaveMapButton:document.getElementById("map-editor-save-map-btn"),
    mapEditorFileMenuHidden:true,


    
    /*
    mapEditorSavedMapListButton:document.getElementById("map-editor-saved-maps-btn"),
    mapEditorSavedMapList:document.getElementById("map-editor-saved-maps-list"),
    mapEditorCanvas:document.getElementById("map-editor-canvas"),
    mapEditorPaintLandIcon:document.getElementById("map-editor-paint-land-img"),
    mapEditorPaintWoodsIcon:document.getElementById("map-editor-paint-woods-img"),
    mapEditorPaintWaterIcon:document.getElementById("map-editor-paint-water-img"),
    mapEditorPaintPortIcon:document.getElementById("map-editor-paint-port-img"),
    mapEditorLogoutButton:document.getElementById("map-editor-logout-btn"),
    mapEditorFileDropDownList:document.getElementById("map-editor-file-menu"),
    mapEditorSaveMapButton:document.getElementById("save-map-btn");
    mapEditorFileMenuHidden:true,
*/
    
    
	// UI flags
	userListHidden:true,
	chatWindowHidden:true,
	statsMenuHidden:true,
    savedGamesMenuHidden:true,
    


    
    
}

dom.document.onkeydown = function(event) { router.route({name:"keyPressed", data:event}); }
dom.document.onkeyup = function(event) { router.route({name:"keyReleased", data:event}); }

dom.chatForm.onsubmit = function(event) { router.route({name:"chatFormSubmit", data:event}); }
dom.chatToggleButton.onclick = function() { router.route({name:"toggleChatWindow", data:null}); }

dom.statsMenuButton.onclick = function() { router.route({name:"toggleStatsMenu", data:null}); }

dom.userListButton.onclick = function() { router.route({name:"toggleUserList", data:null}); }
dom.loginButton.onclick = function() { router.route({name:"loginClick", data:null}); }
dom.signupButton.onclick = function() { router.route({name:"signupClick", data:null}); }
dom.logoutButton.onclick = function() { router.route({name:"logoutClick", data:null}); }
dom.deleteAccountButton.onclick = function() { router.route({name:"deleteAccountClick", data:null}); }

dom.savedGamesMenuButton.onclick = function() { router.route({name:"toggleSavedGamesMenu", data:null}); }
dom.saveGameButton.onclick = function() { router.route({name:"saveGameClick", data:null}); }
dom.loadGameButton.onclick = function() { router.route({name:"loadGameClick", data:null}); }
dom.deleteGameButton.onclick = function() { router.route({name:"deleteGameClick", data:null}); }

dom.clearStatsButton.onclick = function() { router.route({name:"clearStatsClick", data:null}); }

    // map editor event handling
    dom.mapEditorSavedMapsListButton.onclick =
	function() { router.route({name:"mapEditorSavedMapsListButtonClick", data:null}); }
    dom.mapEditorSaveMapButton.onclick =
	function() { router.route({name:"mapEditorSaveMapButtonClick", data:null}); }
    //canvas
    dom.mapEditorCanvas.onmousedown =
	function(event) { router.route({name:"mapEditorCanvasMouseDown", data:event}); }
    dom.mapEditorCanvas.onmouseup =
	function(event) { router.route({name:"mapEditorCanvasMouseUp", data:event}); }
    dom.mapEditorCanvas.onmousemove =
	function(event) { router.route({name:"mapEditorCanvasMouseMove", data:event}); }
    //land icon
    dom.mapEditorPaintLandIcon.onclick =
	function() { router.route({name:"mapEditorPaintLandIconClick", data:null}); }
    dom.mapEditorPaintLandIcon.title = "land";
    //woods icon
    dom.mapEditorPaintWoodsIcon.onclick =
	function() { router.route({name:"mapEditorPaintWoodsIconClick", data:null}); }
    dom.mapEditorPaintWoodsIcon.title = "woods";
    //water icon
    dom.mapEditorPaintWaterIcon.onclick =
	function() { router.route({name:"mapEditorPaintWaterIconClick", data:null}); }
    dom.mapEditorPaintWaterIcon.title = "water";
    //port icon
    dom.mapEditorPaintPortIcon.onclick =
	function() { router.route({name:"mapEditorPaintPortIconClick", data:null}); }
    dom.mapEditorPaintPortIcon.title = "port";
    //zoom icon
    
    
dom.canvas.font = "30px Arial";
dom.mapEditorCanvas.font = "30px Arial";
    
return dom;

});

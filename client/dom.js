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

	// Game screen
	gameScreen:document.getElementById("game-screen"),
	canvas:document.getElementById("canvas").getContext("2d"),

	// Session menu
	sessionMenu:document.getElementById("session-menu"),
    usernameLabel:document.getElementById("username-label"),
   	usertypeLabel:document.getElementById("usertype-label"),
	logoutButton:document.getElementById("logout-btn"),
	deleteAccountButton:document.getElementById("delete-account-btn"),
	savedGamesMenuButton:document.getElementById("saved-games-menu-btn"),
	statsMenuButton:document.getElementById("stats-menu-btn"),

	// Save game menu
	savedGamesMenu:document.getElementById("saved-games-menu"),
	loadGameButton:document.getElementById("load-game-btn"),
	saveGameButton:document.getElementById("save-game-btn"),
	deleteGameButton:document.getElementById("delete-game-btn"),
	savedGamesList:document.getElementById("saved-games-list"),

	// Stats menu
	statsMenu:document.getElementById("stats-menu"),
	statsList:document.getElementById("stats-list"),
	clearStatsButton:document.getElementById("clear-stats-btn"),

	// Options menu
	optionsMenu:document.getElementById("options-menu"),
	chatToggleButton:document.getElementById("chat-toggle-btn"),

	// Chat window
	chatWindow:document.getElementById("chat-window"),
	chatLog:document.getElementById("chat-log"),
	chatForm:document.getElementById("chat-form"),
	chatInput:document.getElementById("chat-input"),
	chatSubmitButton:document.getElementById("chat-submit-btn"),

    // MapEditor window
    mapEditorScreen:document.getElementById("map-editor-screen"),

    mapEditorCanvas:document.getElementById("map-editor-canvas"),
    mapEditorCanvasContext:document.getElementById("map-editor-canvas").getContext("2d"),
    mapEditorIconPanel:document.getElementById("map-editor-icon-panel"),
    mapEditorPaintSandIcon:document.getElementById("map-editor-paint-sand-img"),
    mapEditorPaintGrassIcon:document.getElementById("map-editor-paint-grass-img"),
    mapEditorPaintWaterIcon:document.getElementById("map-editor-paint-water-img"),
    mapEditorPaintPortIcon:document.getElementById("map-editor-paint-port-img"),
    mapEditorLogoutButton:document.getElementById("map-editor-logout-btn"),
    mapEditorTextBox:document.getElementById("map-editor-textbox"),
    
    // MapEditor saved maps list
    mapEditorSavedMapsListButton:document.getElementById("map-editor-saved-maps-btn"),
    mapEditorSavedMapsList:document.getElementById("map-editor-saved-maps-list"),
    mapEditorMapSizeButton:document.getElementById("map-editor-size-btn");
    mapEditorSaveMapButton:document.getElementById("map-editor-save-map-btn"),
    mapEditorLoadMapButton:document.getElementById("map-editor-load-map-btn"),
    mapEditorSavedMapsListHidden:true,
    
    
	// Admin screen
	adminScreen:document.getElementById("admin-screen"),
	
	// User menu
	userMenu:document.getElementById("user-menu"),
	userMenuButton:document.getElementById("user-menu-btn"),
	userList:document.getElementById("user-list"),
	addUserButton:document.getElementById("add-user-btn"),
	deleteUserButton:document.getElementById("delete-user-btn"),
	userTypeButton:document.getElementById("user-type-btn"),
	
	// UI flags
	userMenuHidden:true,
	chatWindowHidden:true,
	statsMenuHidden:true,
    savedGamesMenuHidden:true,
	
}

dom.document.onkeydown = function(event) { router.route({name:"keyPressed", data:event}); }
dom.document.onkeyup = function(event) { router.route({name:"keyReleased", data:event}); }

dom.chatForm.onsubmit = function(event) { router.route({name:"chatFormSubmit", data:event}); }
dom.chatToggleButton.onclick = function() { router.route({name:"toggleChatWindow", data:null}); }

dom.statsMenuButton.onclick = function() { router.route({name:"toggleStatsMenu", data:null}); }
dom.clearStatsButton.onclick = function() { router.route({name:"clearStatsClick", data:null}); }

dom.userMenuButton.onclick = function() { router.route({name:"toggleUserMenu", data:null}); }
dom.addUserButton.onclick = function() { router.route({name:"addUserClick", data:null}); }
dom.deleteUserButton.onclick = function() { router.route({name:"deleteUserClick", data:null}); }
dom.userTypeButton.onclick = function() { router.route({name:"userTypeClick", data:null}); }

dom.loginButton.onclick = function() { router.route({name:"loginClick", data:null}); }
dom.signupButton.onclick = function() { router.route({name:"signupClick", data:null}); }
dom.logoutButton.onclick = function() { router.route({name:"logoutClick", data:null}); }
dom.deleteAccountButton.onclick = function() { router.route({name:"deleteAccountClick", data:null}); }

dom.savedGamesMenuButton.onclick = function() { router.route({name:"toggleSavedGamesMenu", data:null}); }
dom.saveGameButton.onclick = function() { router.route({name:"saveGameClick", data:null}); }
dom.loadGameButton.onclick = function() { router.route({name:"loadGameClick", data:null}); }
dom.deleteGameButton.onclick = function() { router.route({name:"deleteGameClick", data:null}); }

    // map editor event handling
    dom.mapEditorSavedMapsListButton.onclick =
	function() { router.route({name:"mapEditorSavedMapsListButtonClick", data:null}); }
	
    dom.mapEditorSaveMapButton.onclick =
	function() { router.route({name:"mapEditorSaveMapButtonClick", data:null}); }
	
    dom.mapEditorLoadMapButton.onclick = 
	function() { router.route({name:"mapEditorLoadMapButtonClick", data:null}); }

    dom.mapEditorSizeButton.onclick = 
	function() { router.route({name:"mapEditorSizeButtonClick", data:null}); }

    dom.mapEditorLogoutButton.onclick =
	function() { router.route({name:"mapEditorLogoutButtonClick", data:null}) };
	
    //canvas
    dom.mapEditorCanvas.onmousedown =
	function(event) { router.route({name:"mapEditorCanvasMouseDown", data:event}); }
    
    dom.mapEditorCanvas.onclick =
	function(event) { router.route({name:"mapEditorCanvasClick", data:event}); }
	
    dom.mapEditorCanvas.onmouseup =
	function(event) { router.route({name:"mapEditorCanvasMouseUp", data:event}); }
	
    dom.mapEditorCanvas.onmousemove =
	function(event) { router.route({name:"mapEditorCanvasMouseMove", data:event}); }
    dom.mapEditorCanvas.onmouseup =
	function(event) { router.route({name:"mapEditorCanvasMouseUp", data:event}); }
    dom.mapEditorCanvas.onmouseleave =
	function(event) { router.route({name:"mapEditorCanvasMouseLeave", data:event}); }
    
    //land icon
    dom.mapEditorPaintSandIcon.onclick =
	function() { router.route({name:"mapEditorPaintSandIconClick", data:null}); }
	
    dom.mapEditorPaintSandIcon.title = "sand";
	
    //woods icon
    dom.mapEditorPaintGrassIcon.onclick =
	function() { router.route({name:"mapEditorPaintGrassIconClick", data:null}); }
	
    dom.mapEditorPaintGrassIcon.title = "grass";
	
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
dom.mapEditorCanvasContext.font = "30px Arial";

dom.show = function(data) {
	for(var i in data) {
		data[i].style.display = "block";
	}
}

dom.hide = function(data) {
	for(var i in data) {
		data[i].style.display = "none";
	}
}

return dom;

});

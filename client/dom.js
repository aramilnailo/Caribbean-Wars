define(["router"], function(router) {

var dom = {
	
	// Document
	document:document,

	// Login page
	loginScreen:document.getElementById("login-screen"),
    loginUsername:document.getElementById("login-username"),
	loginPassword:document.getElementById("login-password"),
    loginUsertype:{},
    loginUsertypeForm:document.getElementById("login-usertype-radiobox"),
	loginButton:document.getElementById("login-btn"),
	signupButton:document.getElementById("signup-btn"),

	// Upper menu
	upperMenu:document.getElementById("upper-menu"),
    usernameLabel:document.getElementById("username-label"),
   	usertypeLabel:document.getElementById("usertype-label"),
	logoutButton:document.getElementById("logout-btn"),
	deleteAccountButton:document.getElementById("delete-account-btn"),
	savedGamesMenuButton:document.getElementById("saved-games-menu-btn"),
	savedMapsMenuButton:document.getElementById("saved-maps-menu-btn"),
	statsMenuButton:document.getElementById("stats-menu-btn"),

	// In Game menu
	inGameMenu:document.getElementById("in-game-menu"),
	stopGameButton:document.getElementById("stop-game-btn"),
	leaveGameButton:document.getElementById("leave-game-btn"),

	// Host menu
	hostMenu:document.getElementById("host-menu"),
	inviteButton:document.getElementById("invite-btn"),
	kickButton:document.getElementById("kick-btn"),
	promoteButton:document.getElementById("promote-btn"),
	
	// Saved games menu
	savedGamesMenu:document.getElementById("saved-games-menu"),
	savedGamesList:document.getElementById("saved-games-list"),
	saveGameButton:document.getElementById("save-game-btn"),
	loadGameButton:document.getElementById("load-game-btn"),
	deleteGameButton:document.getElementById("delete-game-btn"),
	
    // Saved maps menu
	savedMapsMenu:document.getElementById("saved-maps-menu"),
	savedMapsList:document.getElementById("saved-maps-list"),
    saveMapButton:document.getElementById("save-map-btn"),
  	loadMapButton:document.getElementById("load-map-btn"),
	deleteMapButton:document.getElementById("delete-map-btn"),
	
	// Stats menu
	statsMenu:document.getElementById("stats-menu"),
	statsList:document.getElementById("stats-list"),
	clearStatsButton:document.getElementById("clear-stats-btn"),
	
	// Game screen
	gameScreen:document.getElementById("game-screen"),
	canvas:document.getElementById("canvas").getContext("2d"),
	
	// Admin screen
	adminScreen:document.getElementById("admin-screen"),
	userMenuButton:document.getElementById("user-menu-btn"),
	
	// User menu
	userMenu:document.getElementById("user-menu"),
	userList:document.getElementById("user-list"),
	addUserButton:document.getElementById("add-user-btn"),
	deleteUserButton:document.getElementById("delete-user-btn"),
	userTypeButton:document.getElementById("user-type-btn"),
	
	// Session browser
	sessionBrowser:document.getElementById("session-browser"),
	sessionMenuButton:document.getElementById("session-menu-btn"),
	
	// Session menu
	sessionMenu:document.getElementById("session-menu"),
	sessionList:document.getElementById("session-list"),
	joinSessionButton:document.getElementById("join-session-btn"),
	newSessionButton:document.getElementById("new-session-btn"),
	
	// Lobby screen
	lobbyScreen:document.getElementById("lobby-screen"),
	lobbyPlayerList:document.getElementById("lobby-player-list"),
	hostLobbyButtons:document.getElementById("host-lobby-btns"),
	newGameButton:document.getElementById("new-game-btn"),
	resumeGameButton:document.getElementById("resume-game-btn"),
	endSessionButton:document.getElementById("end-session-btn"),
	lobbyButtons:document.getElementById("lobby-btns"),
	leaveSessionButton:document.getElementById("leave-session-btn"),
	joinInProgressButton:document.getElementById("join-in-progress-btn"),

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

    // MapEditor textbox
    mapEditorTextbox:document.getElementById("map-editor-textbox"),
    mapEditorTextboxMessage:document.getElementById("map-editor-textbox-msg"),
    mapEditorTextboxResizeForm:document.getElementById("map-editor-textbox-resize-form"),
    mapEditorResizedLX:document.getElementById("map-editor-new-lx"),
    mapEditorResizedLY:document.getElementById("map-editor-new-ly"),
    mapEditorResizeSubmitButton:document.getElementById("map-editor-resize-submit-btn"),
    mapEditorTextboxZoomForm:document.getElementById("map-editor-textbox-zoom-form"),
    mapEditorNewZoom:document.getElementById("map-editor-new-zoom"),
    mapEditorZoomSubmitButton:document.getElementById("map-editor-zoom-submit-btn"),
    
    // MapEditor brush button panel
    mapEditorBrush20:document.getElementById("map-editor-brush-20"),
    mapEditorBrush18:document.getElementById("map-editor-brush-18"),
    mapEditorBrush16:document.getElementById("map-editor-brush-16"),
    mapEditorBrush14:document.getElementById("map-editor-brush-14"),
    mapEditorBrush12:document.getElementById("map-editor-brush-12"),
    mapEditorBrush10:document.getElementById("map-editor-brush-10"),
    mapEditorBrush08:document.getElementById("map-editor-brush-08"),
    mapEditorBrush06:document.getElementById("map-editor-brush-06"),
    mapEditorBrush04:document.getElementById("map-editor-brush-04"),
    mapEditorBrush02:document.getElementById("map-editor-brush-02"),
    mapEditorBrush01:document.getElementById("map-editor-brush-01"),
	
	// MapEditor buttons
    mapEditorMapResizeButton:document.getElementById("map-editor-resize-btn"),
	mapEditorResizeButton:document.getElementById("map-editor-resize-btn"),
	mapEditorZoomButton:document.getElementById("map-editor-zoom-btn"),
    mapEditorClearMapButton:document.getElementById("map-editor-clear-map-btn"),
    mapEditorUndoChangeButton:document.getElementById("map-editor-undo-btn"),
    mapEditorRedoChangeButton:document.getElementById("map-editor-redo-btn")
	
}

// Login screen
dom.loginButton.onclick = function() { router.route({name:"loginClick", data:null}); }
dom.signupButton.onclick = function() { router.route({name:"signupClick", data:null}); }

// Upper menu
dom.logoutButton.onclick = function() { router.route({name:"logoutClick", data:null}); }
dom.deleteAccountButton.onclick = function() { router.route({name:"deleteAccountClick", data:null}); }
dom.savedGamesMenuButton.onclick = function() { router.route({name:"savedGamesMenuToggle", data:null}); }
dom.statsMenuButton.onclick = function() { router.route({name:"statsMenuToggle", data:null}); }

// In game menu
dom.stopGameButton.onclick = function() { router.route({name:"stopGameClick", data:null}); }
dom.leaveGameButton.onclick = function() { router.route({name:"leaveGameClick", data:null}); }

// Host menu
dom.inviteButton.onclick = function() { router.route({name:"inviteClick", data:null}); }
dom.kickButton.onclick = function() { router.route({name:"kickClick", data:null}); }
dom.promoteButton.onclick = function() { router.route({name:"promoteClick", data:null}); }

// Saved games menu
dom.saveGameButton.onclick = function() { router.route({name:"saveGameClick", data:null}); }
dom.loadGameButton.onclick = function() { router.route({name:"loadGameClick", data:null}); }
dom.deleteGameButton.onclick = function() { router.route({name:"deleteGameClick", data:null}); }

// Saved maps menu
dom.savedMapsMenuButton.onclick = function() { router.route({name:"savedMapsMenuToggle", data:null}); }
dom.saveMapButton.onclick = function() { router.route({name:"saveMapClick", data:null}); }
dom.loadMapButton.onclick = function() { router.route({name:"loadMapClick", data:null}); }
dom.deleteMapButton.onclick = function() { router.route({name:"deleteMapClick", data:null}); }

// Stats menu
dom.clearStatsButton.onclick = function() { router.route({name:"clearStatsClick", data:null}); }

// Admin screen
dom.userMenuButton.onclick = function() { router.route({name:"userMenuToggle", data:null}); }

// User menu
dom.addUserButton.onclick = function() { router.route({name:"addUserClick", data:null}); }
dom.deleteUserButton.onclick = function() { router.route({name:"deleteUserClick", data:null}); }
dom.userTypeButton.onclick = function() { router.route({name:"userTypeClick", data:null}); }

// Session browser
dom.sessionMenuButton.onclick = function() { router.route({name:"sessionMenuToggle", data:null}); }

// Session menu
dom.joinSessionButton.onclick = function() { router.route({name:"joinSessionClick", data:null}); }
dom.newSessionButton.onclick = function() { router.route({name:"newSessionClick", data:null}); }

// Lobby menu
dom.newGameButton.onclick = function() { router.route({name:"newGameClick", data:null}); }
dom.resumeGameButton.onclick = function() { router.route({name:"resumeGameClick", data:null}); }
dom.endSessionButton.onclick = function() { router.route({name:"endSessionClick", data:null}); }
dom.leaveSessionButton.onclick = function() { router.route({name:"leaveSessionClick", data:null}); }
dom.joinInProgressButton.onclick = function() { router.route({name:"joinInProgressClick", data:null}); }

// Options menu
dom.chatToggleButton.onclick = function() { router.route({name:"chatWindowToggle", data:null}); }

// Chat window
dom.chatForm.onsubmit = function(event) { router.route({name:"chatFormSubmit", data:event}); }

// Input
dom.document.onkeydown = function(event) { router.route({name:"keyPressed", data:event}); }
dom.document.onkeyup = function(event) { router.route({name:"keyReleased", data:event}); }
	
    dom.mapEditorResizeButton.onclick = 
	function() { router.route({name:"mapEditorResizeButtonClick", data:null}); }
    dom.mapEditorResizeSubmitButton.onclick=
	function() { router.route({name:"mapEditorResizeSubmitButtonClick", data:null}); }
    dom.mapEditorClearMapButton.onclick =
	function() { router.route({name:"mapEditorClearMapButtonClick", data:null}) };
    dom.mapEditorUndoChangeButton.onclick =
	function() { router.route({name:"mapEditorUndoChangeButtonClick", data:null}) };
    dom.mapEditorRedoChangeButton.onclick =
	function() { router.route({name:"mapEditorRedoChangeButtonClick", data:null}) };
    dom.mapEditorZoomButton.onclick = 
	function() { router.route({name:"mapEditorZoomButtonClick", data:null}); }
    dom.mapEditorZoomSubmitButton.onclick=
	function() { router.route({name:"mapEditorZoomSubmitButtonClick", data:null}); }

    //map editor canvas
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
    
    //map editor paint icons
    dom.mapEditorPaintSandIcon.onclick =
	function() { router.route({name:"mapEditorPaintSandIconClick", data:null}); }
    dom.mapEditorPaintSandIcon.title = "sand";
    dom.mapEditorPaintGrassIcon.onclick =
	function() { router.route({name:"mapEditorPaintGrassIconClick", data:null}); }
    dom.mapEditorPaintGrassIcon.title = "grass";
    dom.mapEditorPaintWaterIcon.onclick =
	function() { router.route({name:"mapEditorPaintWaterIconClick", data:null}); }
    dom.mapEditorPaintWaterIcon.title = "water";
    dom.mapEditorPaintPortIcon.onclick =
	function() { router.route({name:"mapEditorPaintPortIconClick", data:null}); }
    dom.mapEditorPaintPortIcon.title = "port";

    //map editor brush icons
    dom.mapEditorBrush20.onclick = 
	function(event) { router.route({name:"mapEditorBrush20Click", data:null}); }
    dom.mapEditorBrush18.onclick = 
	function(event) { router.route({name:"mapEditorBrush18Click", data:null}); }
    dom.mapEditorBrush16.onclick = 
	function(event) { router.route({name:"mapEditorBrush16Click", data:null}); }
    dom.mapEditorBrush14.onclick = 
	function(event) { router.route({name:"mapEditorBrush14Click", data:null}); }
    dom.mapEditorBrush12.onclick = 
	function(event) { router.route({name:"mapEditorBrush12Click", data:null}); }
    dom.mapEditorBrush10.onclick = 
	function(event) { router.route({name:"mapEditorBrush10Click", data:null}); }
    dom.mapEditorBrush08.onclick = 
	function(event) { router.route({name:"mapEditorBrush08Click", data:null}); }
    dom.mapEditorBrush06.onclick = 
	function(event) { router.route({name:"mapEditorBrush06Click", data:null}); }
    dom.mapEditorBrush04.onclick = 
	function(event) { router.route({name:"mapEditorBrush04Click", data:null}); }
    dom.mapEditorBrush02.onclick = 
	function(event) { router.route({name:"mapEditorBrush02Click", data:null}); }
    dom.mapEditorBrush01.onclick = 
	function(event) { router.route({name:"mapEditorBrush01Click", data:null}); }

return dom;

});

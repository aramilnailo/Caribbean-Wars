define(["router"], function(router) {

var dom = {
	
	// Document
	document:document,

	// Alert box
	alertBox:document.getElementById("alert-box"),
	alertText:document.getElementById("alert-text"),

	// Prompt box
	promptBox:document.getElementById("prompt-box"),
	promptText:document.getElementById("prompt-text"),
	promptCloseButton:document.getElementById("prompt-close-btn"),
	promptForm:document.getElementById("prompt-form"),
	promptInput:document.getElementById("prompt-input"),

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
	
	// Map editor menu
	mapEditorMenu:document.getElementById("map-editor-menu"),
	undoButton:document.getElementById("undo-btn"),
	redoButton:document.getElementById("redo-btn"),
	resizeButton:document.getElementById("resize-btn"),
	clearButton:document.getElementById("clear-btn"),
	
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
	consoleToggleButton:document.getElementById("console-toggle-btn"),

	// Chat window
	chatWindow:document.getElementById("chat-window"),
	chatLog:document.getElementById("chat-log"),
	chatForm:document.getElementById("chat-form"),
	chatInput:document.getElementById("chat-input"),
	
	// Console window
	consoleWindow:document.getElementById("console-window"),
	consoleLog:document.getElementById("console-log"),
	consoleForm:document.getElementById("console-form"),
	consoleInput:document.getElementById("console-input"),
	
    // Map editor screen
    mapEditorScreen:document.getElementById("map-editor-screen"),
	mapEditorBrushPanel:document.getElementById("map-editor-brush-panel"),
	mapEditorCanvas:document.getElementById("map-editor-canvas"),
    mapEditorCanvasContext:document.getElementById("map-editor-canvas").getContext("2d"),
		
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

// Map editor screen
dom.undoButton.onclick = function() { router.route({name:"undoClick", data:null}); }
dom.redoButton.onclick = function() { router.route({name:"redoClick", data:null}); }
dom.resizeButton.onclick = function() { router.route({name:"resizeClick", data:null}); }
dom.clearButton.onclick = function() { router.route({name:"clearClick", data:null}); }

// Options menu
dom.chatToggleButton.onclick = function() { router.route({name:"chatWindowToggle", data:null}); }
dom.consoleToggleButton.onclick = function() { router.route({name:"consoleWindowToggle", data:null}); }

// Chat window
dom.chatForm.onsubmit = function(event) { router.route({name:"chatFormSubmit", data:event}); }

// Console window
dom.consoleForm.onsubmit = function(event) { router.route({name:"consoleFormSubmit", data:event}); }

// Input
dom.document.onkeydown = function(event) { router.route({name:"keyPressed", data:event}); }
dom.document.onkeyup = function(event) { router.route({name:"keyReleased", data:event}); }

// Map editor mouse events
dom.mapEditorCanvas.onmousedown = function(event) { router.route({name:"mapEditorCanvasMouseDown", data:event}); }
dom.mapEditorCanvas.onclick = function(event) { router.route({name:"mapEditorCanvasClick", data:event}); }
dom.mapEditorCanvas.onmouseup = function(event) { router.route({name:"mapEditorCanvasMouseUp", data:event}); }
dom.mapEditorCanvas.onmousemove = function(event) { router.route({name:"mapEditorCanvasMouseMove", data:event}); }
dom.mapEditorCanvas.onmouseup = function(event) { router.route({name:"mapEditorCanvasMouseUp", data:event}); }
dom.mapEditorCanvas.onmouseleave = function(event) { router.route({name:"mapEditorCanvasMouseLeave", data:event}); }


// Game screen events
//dom.canvas.onmousedown = function(event) { router.route({name:"gameCanvasMouseDown", data:event}); }
dom.canvas.onclick = function(event) { router.route({name:"gameCanvasClick", data:event}); }
dom.canvas.ondblclick = function(event) { router.route({name:"gameCanvasDoubleClick", data:event}); }
//dom.canvas.onmouseup = function(event) { router.route({name:"gameCanvasMouseUp", data:event}); }
//dom.canvas.onmousemove = function(event) { router.route({name:"gameCanvasMouseMove", data:event}); }
//dom.canvas.onmouseleave = function(event) { router.route({name:"gameCanvasMouseLeave", data:event}); }
    
    
return dom;

});

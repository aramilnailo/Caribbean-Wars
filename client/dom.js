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

	// Confirm box
	confirmBox:document.getElementById("confirm-box"),
	confirmText:document.getElementById("confirm-text"),
	confirmYesButton:document.getElementById("confirm-yes-btn"),
	confirmNoButton:document.getElementById("confirm-no-btn"),

	// Right click menu
	rightClickMenu:document.getElementById("right-click-menu"),

	// Login page
	loginScreen:document.getElementById("login-screen"),
    loginUsername:document.getElementById("login-username"),
	loginUsertype:{},
	loginPassword:document.getElementById("login-password"),
    loginUsertypeForm:document.getElementById("login-usertype-radiobox"),
	loginButton:document.getElementById("login-btn"),
	signupButton:document.getElementById("signup-btn"),

	// Main menu
	mainMenu:document.getElementById("main-menu"),
	mainMenuButtons:document.getElementById("main-menu-btns"),
	inGameMenu:document.getElementById("in-game-menu"),
	
	// Settings menu
	settingsMenu:document.getElementById("settings-menu"),

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
	easel:document.getElementById("canvas"),
	canvas:document.getElementById("canvas").getContext("2d"),
	oceanCanvas:document.getElementById("ocean-canvas").getContext("2d"),
	portMenu:document.getElementById("port-menu"),
	
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
	rulesEditorButton:document.getElementById("rules-editor-btn"),
	lobbyButtons:document.getElementById("lobby-btns"),
	leaveSessionButton:document.getElementById("leave-session-btn"),
	joinInProgressButton:document.getElementById("join-in-progress-btn"),
	mapSelectButton:document.getElementById("map-select-btn"),
	mapPreview:document.getElementById("map-preview"),

	// Rules editor
	rulesEditor:document.getElementById("rules-editor"),
	rulesEditorScreen:document.getElementById("rules-editor-screen"),
	ruleSetList:document.getElementById("rule-set-list"),
	confirmRuleSetButton:document.getElementById("confirm-rule-set-btn"),
	cancelRuleSetButton:document.getElementById("cancel-rule-set-btn"),
	saveRuleSetButton:document.getElementById("save-rule-set-btn"),
	loadRuleSetButton:document.getElementById("load-rule-set-btn"),

	// Upper container
	upperContainer:document.getElementById("upper-container"),
	mainMenuButton:document.getElementById("main-menu-btn"),
	settingsMenuButton:document.getElementById("settings-menu-btn"),

	// Lower container
	lowerContainer:document.getElementById("lower-container"),
	chatToggle:document.getElementById("chat-toggle"),
	consoleToggle:document.getElementById("console-toggle"),

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

// Saved games menu
dom.saveGameButton.onclick = function() { router.route({name:"saveGameClick", data:null}); }
dom.loadGameButton.onclick = function() { router.route({name:"loadGameClick", data:null}); }
dom.deleteGameButton.onclick = function() { router.route({name:"deleteGameClick", data:null}); }

// Saved maps menu
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
dom.rulesEditorButton.onclick = function() { router.route({name:"rulesEditorScreen", data:null}); }
dom.leaveSessionButton.onclick = function() { router.route({name:"leaveSessionClick", data:null}); }
dom.joinInProgressButton.onclick = function() { router.route({name:"joinInProgressClick", data:null}); }
dom.mapSelectButton.onclick = function() { router.route({name:"mapSelectClick", data:null}); }

// Rules editor screen
dom.confirmRuleSetButton.onclick = function() { router.route({name:"confirmRuleSetClick", data:null}); }
dom.cancelRuleSetButton.onclick = function() { router.route({name:"cancelRuleSetClick", data:null}); }
dom.saveRuleSetButton.onclick = function() { router.route({name:"saveRuleSetClick", data:null}); }
dom.loadRuleSetButton.onclick = function() { router.route({name:"loadRuleSetClick", data:null}); }

// Map editor screen
dom.undoButton.onclick = function() { router.route({name:"undoClick", data:null}); }
dom.redoButton.onclick = function() { router.route({name:"redoClick", data:null}); }
dom.resizeButton.onclick = function() { router.route({name:"resizeClick", data:null}); }
dom.clearButton.onclick = function() { router.route({name:"clearClick", data:null}); }

// Upper container
dom.mainMenuButton.onclick = function() { router.route({name:"mainMenuToggle", data:null}); }
dom.settingsMenuButton.onclick = function() { router.route({name:"settingsMenuToggle", data:null}); }

// Lower container
dom.chatToggle.onclick = function() { router.route({name:"chatWindowToggle", data:null}); }
dom.consoleToggle.onclick = function() { router.route({name:"consoleWindowToggle", data:null}); }

// Chat window
dom.chatForm.onsubmit = function(event) { router.route({name:"chatFormSubmit", data:event}); }

// Console window
dom.consoleForm.onsubmit = function(event) { router.route({name:"consoleFormSubmit", data:event}); }

// Map editor mouse events
dom.mapEditorCanvas.onmousedown = function(event) { router.route({name:"mapEditorCanvasMouseDown", data:event}); }
dom.mapEditorCanvas.onclick = function(event) { router.route({name:"mapEditorCanvasClick", data:event}); }
dom.mapEditorCanvas.onmouseup = function(event) { router.route({name:"mapEditorCanvasMouseUp", data:event}); }
dom.mapEditorCanvas.onmousemove = function(event) { router.route({name:"mapEditorCanvasMouseMove", data:event}); }
dom.mapEditorCanvas.onmouseup = function(event) { router.route({name:"mapEditorCanvasMouseUp", data:event}); }
dom.mapEditorCanvas.onmouseleave = function(event) { router.route({name:"mapEditorCanvasMouseLeave", data:event}); }

// Input
dom.document.onkeydown = function(event) { router.route({name:"keyPressed", data:event}); }
dom.document.onkeyup = function(event) { router.route({name:"keyReleased", data:event}); }

// Mouse click events
dom.document.onclick = function(event) { router.route({name:"leftClick", data:event}); }
dom.document.ondblclick = function(event) { router.route({name:"doubleClick", data:event}); }

if (document.addEventListener) { // IE >= 9; other browsers
	document.addEventListener('contextmenu', function(event) {
		router.route({name:"rightClick", data:event});
	}, false);
}

return dom;

});

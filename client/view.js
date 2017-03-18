/**
* View controller namespace. Provides the logic to transition between gui views.
*
* @module client/View
*/
define(["debug", "dom", "client"], function(debug, dom, client) {

var View = function() {};

/**
* Registers all gui messages whose actions are
* implemented by the view controller
*
* @memberof module:client/View
* @param router The class responsible for routing
*               gui messages
*/
View.prototype.listen = function(router) {
    if (debug.view) debug.log("client/view.js: listen()");
    router.listen("loginResponse", this.exitLoginScreen);
    router.listen("logoutResponse", this.returnToLoginScreen);
	router.listen("enterLobby", this.enterLobby);
	router.listen("exitLobby", this.exitLobby);
	router.listen("exitToLobby", this.gameScreenToLobby);
	router.listen("enterGame", this.enterGameScreen);
	router.listen("keyPressed", this.keyPressed);
	router.listen("keyReleased", this.keyReleased);
}

/**
* Transition from login screen to the game screen
*
* TO BE REPLACED by loginViewToLobbyView
*
* @memberof module:client/View
* @param data Login data. Members:
*                data.success True on successful login
*                data.username
*/
View.prototype.exitLoginScreen = function(data) {
    if(debug.view) debug.log("[View] exitLoginScreen()");
	dom.hide([dom.loginScreen]);
	dom.usernameLabel.innerHTML = data.username;
	client.username = data.username;
	client.usertype = data.usertype;
	if(client.usertype === "editor") {
	    if(debug.view) debug.log("[View] Moving to map editor screen");
	    dom.show([dom.mapEditorScreen]);
	    client.emit("getEditMap", {filename:"",username:client.username,usertype:client.usertype});
	} else if(client.usertype === "admin") {
		if(debug) debug.log("[View] Moving to admin screen");
		dom.show([dom.inGameMenu, dom.adminScreen, dom.optionsMenu]);
	} else {
	    if(debug) debug.log("[View] Moving to lobby screen: username="+data.username+"; usertype="+data.usertype);
		dom.hide([dom.lobbyPlayerList, dom.hostLobbyButtons, dom.nonHostLobbyButtons]);
		dom.show([dom.lobbyScreen, dom.sessionBrowserButtons, dom.inGameMenu, dom.optionsMenu]);
	}
}

View.prototype.enterLobby = function(data) {
	debug.log("[View] enter lobby");
	dom.hide([dom.sessionBrowserButtons, dom.sessionMenu]);
	dom.show([dom.lobbyPlayerList]);
	if(data.isHost) {
		dom.show([dom.hostLobbyButtons]);
	} else {
		dom.show([dom.nonHostLobbyButtons]);
	}
}

View.prototype.exitLobby = function() {
	debug.log("[View] exit lobby");
	dom.hide([dom.lobbyPlayerList, dom.hostLobbyButtons, 
		dom.nonHostLobbyButtons]);
	dom.show([dom.sessionBrowserButtons]);
}

View.prototype.enterGameScreen = function(data) {
	client.emit("getGameMap", null);
	dom.hide([dom.lobbyScreen]);
	dom.show([dom.gameScreen, dom.inGameMenu, dom.optionsMenu]);
}

/**
* Transition from the game screen to login screen
*
* @memberof module:client/View
*/
View.prototype.returnToLoginScreen = function(data) {
	if(debug.view) debug.log("[View] returning to login screen");
	dom.hide([dom.gameScreen, dom.inGameMenu,
		dom.statsMenu, dom.savedGamesMenu,
		dom.adminScreen, dom.userMenu,
		dom.lobbyScreen, dom.sessionMenu,
		dom.optionsMenu, dom.chatWindow]);
	dom.show([dom.loginScreen]);
    client.username = "";
    client.usertype = "";
	client.player = null;
}

// Move from the game screen back to the lobby
View.prototype.gameScreenToLobby = function(data) {
	if(debug.view) debug.log("[View] Game screen to lobby");
	dom.hide([dom.gameScreen]);
	dom.show([dom.lobbyScreen, dom.lobbyPlayerList]);
	if(data.isHost) {
		dom.show([dom.hostLobbyButtons]);
	} else {
		dom.show([dom.nonHostLobbyButtons]);
	}
}

/**
* Relays keypress to server. 
*
* @memberof module:client/View
* @param event GUI event to process as a key press.
*/
View.prototype.keyPressed = function(event) {
    // If the chat bar is not in focus
    if(dom.chatInput !== dom.document.activeElement) {
	//for compatability with firefox
	var keycode = event.which || event.keyCode;
	if(keycode === 68)
	    client.emit("keyPress", { inputId:"right", state:true});	
	else if(keycode === 83)
	    client.emit("keyPress", { inputId:"down", state:true});
	else if(keycode === 65)
	    client.emit("keyPress", { inputId:"left", state:true});
	else if(keycode === 87)
	    client.emit("keyPress", { inputId:"up", state:true});
    }
}

// srw: shouldn't this logic be inside game.js?
/**
* Relays keyrelease to server. 
*
* @memberof module:client/View
* @param event GUI event to process as a key release.
*/
View.prototype.keyReleased = function(event) {
    if(dom.chatInput !== dom.document.activeElement) {
	var keycode = event.which || event.keyCode;
	if(keycode === 68)
	    client.emit("keyPress", { inputId:"right", state:false});	
	else if(keycode === 83)
	    client.emit("keyPress", { inputId:"down", state:false});
	else if(keycode === 65)
	    client.emit("keyPress", { inputId:"left", state:false});
	else if(keycode === 87)
	    client.emit("keyPress", { inputId:"up", state:false});
    }
}

return new View();

});

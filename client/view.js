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
	router.listen("newGameMapResponse", this.setMap);
	router.listen("getEditMapResponse", this.setMap);
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
	    if(debug) debug.log("[View] Moving to map editor screen");
	    dom.show([dom.mapEditorScreen]);
	    client.emit("getEditMap", {filename:"",username:client.username,usertype:client.usertype});
	} else if(client.usertype === "admin") {
		if(debug) debug.log("[View] Moving to admin screen");
		dom.show([dom.sessionMenu, dom.adminScreen, dom.optionsMenu]);
	} else {
	    if(debug) debug.log("[View] Moving to game screen: username="+data.username+"; usertype="+data.usertype);
		dom.show([dom.gameScreen, dom.sessionMenu, dom.optionsMenu]);
	    client.emit("getGameMap", null);
	}
}

/**
* Transition from the game screen to login screen
*
* @memberof module:client/View
*/
View.prototype.returnToLoginScreen = function(data) {
	if(debug.view) debug.log("[View] returning to login screen");
	if(client.usertype === "editor") {
		dom.hide([dom.mapEditorScreen]);
	} else if(client.usertype === "admin") {
		dom.hide([dom.adminScreen, dom.userList, dom.sessionMenu, dom.statsMenu,
			dom.savedGamesMenu, dom.chatWindow, dom.optionsMenu]);
	} else {
		dom.hide([dom.gameScreen, dom.sessionMenu, dom.statsMenu,
			dom.savedGamesMenu, dom.chatWindow, dom.optionsMenu]);
	}
	dom.show([dom.loginScreen]);
    client.username = "";
    client.usertype = "";
	client.player = null;
}

/**
* Sets the current game map.
* 
* @memberof module:client/View
* @param data Contains the current map as data.mapData.
* @throws alert error message if an error occurred
*         when attempting to set data.mapData.
*/
View.prototype.setMap = function(data) {
	client.map = data;
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

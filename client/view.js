define(["debug", "dom", "client"], function(debug, dom, client) {

/**
* View controller namespace.
*
* Provides the logic to transition between gui views.
*/
var View = function() {};

/**
* Registers all gui messages whose actions are
* implemented by the view controller
*
* @param router The class responsible for routing
*               gui messages
*/
View.prototype.listen = function(router) {

    router.listen("loginResponse", this.loginToGameScreen);
    router.listen("logoutResponse", this.gameScreenToLogin);

    router.listen("keyPressed", this.keyPressed);
    router.listen("keyReleased", this.keyReleased);
}

/**
* Transition from login screen to the game screen
*
* TO BE REPLACED by loginViewToLobbyView
*
* @param data Login data. Members:
*                data.success True on successful login
*                data.username
*/
View.prototype.loginToGameScreen = function(data) {
    if(debug.view) debug.log("[View] Moving to game screen");
    if(data.success) {
		dom.loginScreen.style.display = "none";
		dom.gameScreen.style.display = "inline-block";
		dom.usernameLabel.innerHTML = data.username;
		client.username = data.username;
		// Request the map data
		client.emit("getMap", null);
    }
}

/**
* Transition from the game screen to login screen
*
*/
View.prototype.gameScreenToLogin = function() {
    dom.loginScreen.style.display = "inline-block";
    dom.gameScreen.style.display = "none";
}

// If input is pressed, emit object with the key and the new state
// srw: shouldn't this logic be inside game.js?
/**
* Relays keypress to server. 
*
* @param event GUI event to process as a key press.
*/
View.prototype.keyPressed = function(event) {
    // If the chat bar is not in focus
    if(dom.chatInput !== dom.document.activeElement) {
	if(event.keyCode === 68)
	    client.emit("keyPress", { inputId:"right", state:true});	
	else if(event.keyCode === 83)
	    client.emit("keyPress", { inputId:"down", state:true});
	else if(event.keyCode === 65)
	    client.emit("keyPress", { inputId:"left", state:true});
	else if(event.keyCode === 87)
	    client.emit("keyPress", { inputId:"up", state:true});
    }
}

// If input is released, emit object with the key and the new state
// srw: shouldn't this logic be inside game.js?
/**
* Relays keyrelease to server. 
*
* @param event GUI event to process as a key release.
*/
View.prototype.keyReleased = function(event) {
    if(dom.chatInput !== dom.document.activeElement) {
	if(event.keyCode === 68)
	    client.emit("keyPress", { inputId:"right", state:false});	
	else if(event.keyCode === 83)
	    client.emit("keyPress", { inputId:"down", state:false});
	else if(event.keyCode === 65)
	    client.emit("keyPress", { inputId:"left", state:false});
	else if(event.keyCode === 87)
	    client.emit("keyPress", { inputId:"up", state:false});
    }
}

return new View();

});

/**
* View controller namespace. Provides the logic to transition between gui views.
*
* @module client/View
*/
define(["debug", "dom", "client", "router"], function(debug, dom, client, router) {

var View = function() {};

    
/**
* Registers all gui messages whose actions are
* implemented by the view controller
*
* @memberof module:client/View
* @param router The class responsible for routing
*               gui messages
*/
View.prototype.listen = function(routr) {
    if (debug.view) debug.log("client/view.js: listen()");
    routr.listen("loginResponse", this.exitLoginScreen);
    routr.listen("logoutResponse", this.gameScreenToLogin);
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
    if(data.success) {
	dom.loginScreen.style.display = "none";
	client.username = data.username;
	client.usertype = data.usertype;
	if (client.usertype == "editor") {
	    if (debug) debug.log("[View] Moving to map editor screen");
	    dom.mapEditorScreen.style.display="inline-block";
	    client.emit("getEditMap", {filename:"",username:client.username,usertype:client.usertype});
	} else {
	    if (debug) debug.log("[View] Moving to game screen: username="+data.username+"; usertype="+data.usertype);
	    dom.gameScreen.style.display = "inline-block";
	    client.emit("getGameMap", null);
	    router.listen("keyPressed", function(event) { new View().keyPressed(event); });
	    router.listen("keyReleased", function(event) { new View().keyReleased(event); });
	}
	dom.usernameLabel.innerHTML = data.username;
    } else {
	if(debug.view) debug.log("[View] data.failure");
    }
}

/**
* Transition from the game screen to login screen
*
* @memberof module:client/View
*/
View.prototype.gameScreenToLogin = function() {
    dom.loginScreen.style.display = "inline-block";
    dom.gameScreen.style.display = "none";
    client.username = "";
    client.usertype = "";
    router.unlisten("keyPressed", function(event) { new View().keyPressed(event); });
    router.unlisten("keyReleased", function(event) { new View().keyReleased(event); });
}

/**
* Transition from the game screen to map editor screen
*
* @memberof module:client/View
*/
View.prototype.mapEditorScreenToLogin = function() {
    dom.loginScreen.style.display = "inline-block";
    dom.mapEditorScreen.style.display = "none";
    client.username = "";
    client.usertype = "";
}

/**
* Sets the current game map.
* 
* @memberof module:client/View
* @param data Contains the current map as data.mapData.
* @throws alert error message if an error occurred
*         when attempting to set data.mapData.
View.prototype.setMap = function(data) {
    if(data.err) {
	   client.pushAlert(data.err);
    } else {
       client.mapData = data;
    }
}
*/

// srw: shouldn't this logic be inside game.js?
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

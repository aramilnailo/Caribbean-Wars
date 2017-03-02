
var debug = require("./debug.js").view;
var log = require("./debug.js").log;

var DOM = require("./dom.js");
var client = require("./client.js");

var View = function() {}

View.prototype.listen = function(router) {
	router.listen("loginResponse", loginToGameScreen);
	router.listen("logoutResponse", gameScreenToLogin);
	router.listen("keyPressed", keyPressed);
	router.listen("keyReleased", keyReleased);
}

View.prototype.loginToGameScreen = function(data) {
    if(data.success === true) {
		DOM.loginScreen.style.display = "none";
		DOM.gameScreen.style.display = "inline-block";
		DOM.usernameLabel.innerHTML = data.username;
		client.username = data.username;
		// Request the map data
		client.emit("getMap", null);
    }
}

View.prototype.gameScreenToLogin = function() {
    DOM.loginScreen.style.display = "inline-block";
    DOM.gameScreen.style.display = "none";
}

// If input is pressed, emit object with the key and the new state
View.prototype.keyPressed = function(event) {
    // If the chat bar is not in focus
    if(DOM.chatInput !== DOM.document.activeElement) {
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
View.prototype.keyReleased = function(event) {
    if(DOM.chatInput !== DOM.document.activeElement) {
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

module.exports = new View();

var debug = require("./debug.js").view;
var log = require("./debug.js").log;

var DOM = require("./dom.js");
var client = require("./client.js");

var View = function() {}

View.prototype.listen = function(router) {
	router.listen("loginResponse", loginToGameScreen);
	router.listen("logoutResponse", gameScreenToLogin);
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

module.exports = new View();
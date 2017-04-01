define(["debug", "dom", "client"], function(debug, dom, client) {

var Alerts = function() {};

Alerts.prototype.listen = function(router) {
	router.listen("alert", this.pushAlert);
	router.listen("log", this.logToConsole);
	router.listen("consoleFormSubmit", this.handleInput);
	router.listen("consoleWindowToggle", this.consoleWindowToggle);
};

Alerts.prototype.pushAlert = function(data) {
	// Show options menu -> console
	if(dom.optionsMenu.style.display === "none") 
		dom.optionsMenu.style.display = "block";
	if(dom.consoleWindow.style.display === "none") {
		Alerts.prototype.consoleWindowToggle();
	}
	dom.consoleLog.innerHTML += "<div>" + data + "</div>";
};

Alerts.prototype.handleInput = function(data) {
    event.preventDefault();
    var input = dom.consoleInput.value;
	client.emit("evalExpression", input);
	dom.consoleInput.value = "";
};

Alerts.prototype.logToConsole = function(data) {
	dom.consoleLog.innerHTML += "<div>" + data + "</div>";
};

Alerts.prototype.consoleWindowToggle = function() {
    if(dom.consoleWindow.style.display === "none") {
		dom.consoleWindow.style.display = "block";
		dom.consoleToggleButton.innerHTML = "Hide console";
		dom.chatWindow.style.display = "none";
		dom.chatToggleButton.innerHTML = "Show chat";
    } else {
		dom.consoleWindow.style.display = "none";
		dom.consoleToggleButton.innerHTML = "Show console";
    }
};

return new Alerts();

});
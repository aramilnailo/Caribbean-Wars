define(["debug", "dom", "client"], function(debug, dom, client) {

var Alerts = function() {};

var messages = [];

Alerts.prototype.listen = function(router) {
	router.listen("alert", this.pushAlert);
	router.listen("log", this.logToConsole);
	router.listen("consoleFormSubmit", this.handleInput);
	router.listen("consoleWindowToggle", this.consoleWindowToggle);
};

Alerts.prototype.pushAlert = function(data) {
	messages.push({text:data, count:20});
};

Alerts.prototype.showPrompt = function(data, cb) {
	dom.promptBox.style.display = "block";
	dom.promptBox.style.top = pageYOffset + "px";
	dom.promptText.innerHTML = data;
	dom.promptInput.value = "";
	dom.promptInput.focus();
	dom.promptCloseButton.onclick = function() {
		cb(null);
		dom.promptInput.blur();
		dom.promptBox.style.display = "none";
	};
	dom.promptForm.onsubmit = function(event) {
		event.preventDefault();
		var value = dom.promptInput.value;
		if(value && value.length > 0) {
			cb(value);
		} else {
			cb(null);
		}
		dom.promptInput.blur();
		dom.promptBox.style.display = "none";
	};
};

Alerts.prototype.confirm = function(data, cb) {
	dom.confirmText.innerHTML = data;
	dom.confirmBox.style.display = "block";
	dom.comfirmBox.style.top = pageYOffset + "px";
	dom.confirmYesButton.onclick = function() {
		cb(true);
		dom.confirmBox.style.display = "none";
	}
	dom.confirmNoButton.onclick = function() {
		cb(false);
		dom.confirmBox.style.display = "none";
	}
};

// Refreshes at 10 fps
Alerts.prototype.displayMessages = function(data) {
	if(messages.length === 0) {
		dom.alertText.style.display = "none";
	} else {
		var newQ = [];
		while(messages.length > 0) {
			var m = messages.shift();
			if(--m.count > 0) {
				newQ.push(m);	// Leaking memory
			}
		}
		messages = newQ;
		var html = "";
		for(var i in messages) {
			html += "<div>" + messages[i].text + "</div>";
		}
		dom.alertText.innerHTML = html;
		dom.alertText.style.display = "block";
		dom.alertBox.style.top = pageYOffset + "px";
	}
};

Alerts.prototype.handleInput = function(event) {
    event.preventDefault();
    var input = dom.consoleInput.value;
	client.emit("evalExpression", input);
	dom.consoleInput.value = "";
};

Alerts.prototype.logToConsole = function(data) {
	dom.consoleLog.innerHTML += "<div>" + data + "</div>";
};

Alerts.prototype.consoleWindowToggle = function(data) {
    if(dom.consoleWindow.style.display === "none") {
		dom.consoleWindow.style.display = "block";
		dom.chatWindow.style.display = "none";
    } else {
		dom.consoleWindow.style.display = "none";
    }
};

return new Alerts();

});

var debug = require("./debug.js").chat;
var log = require("./debug.js").log;

var DOM = require("./dom.js");
var client = require("./client.js");

var Chat = new function() {};

// Display the formatted chat post recieved from the server
Chat.prototype.listen = function(router) {
    router.listen("addToChat", logToChat);
}

Chat.prototype.logToChat = function(data) {
    DOM.chatLog.innerHTML += "<div>" + data + "<\div>";
}

// Show and hide the chat window
Chat.prototype.toggleChatWindow = function() {
    if(DOM.chatWindowHidden) {
		DOM.chatWindow.style.display = "inline-block";
		DOM.chatToggleButton.innerHTML = "Hide chat";
		DOM.chatWindowHidden = false;
    } else {
		DOM.chatWindow.style.display = "none";
		DOM.chatToggleButton.innerHTML = "Show chat";
		DOM.chatWindowHidden = true;
    }
}

DOM.chatForm.onsubmit = function(e) {
    e.preventDefault();
    var input = DOM.chatInput.value;
    if(input[0] === "/") {
		client.emit("evalExpression", input.slice(1));
    } else if(input[0] === "@") {
	// Extract the username from the string
	var user = input.split(" ")[0].slice(1);
	// Extract the message from the string
	var message = input.slice(user.length + 2); // @ + username + space
		client.emit("privateMessage", {user:user, message:message});
    } else {
		client.emit("chatPost", input);
    }
    DOM.chatInput.value = "";
}

DOM.chatToggleButton.onclick = function() {
	toggleChatWindow();
}

module.exports = new Chat();

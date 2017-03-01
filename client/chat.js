
var debug = require("./debug.js").chat;
var log = require("./debug.js").log;

/************************
* Chat window object
************************/

var ChatWindow = new function() {};

var chatWindowHidden = true;

//============== HTML ELEMENTS ============================================
var chatWindow = document.getElementById("chat-window");
var chatLog = document.getElementById("chat-log");
var chatForm = document.getElementById("chat-form");

var chatInput = document.getElementById("chat-input");
var chatSubmitButton = document.getElementById("chat-submit-btn");

var chatToggleButton = document.getElementById("chat-toggle-btn");

chatToggleButton.onclick = function() {
    toggleChatWindow();
}

chatForm.onsubmit = function(e) {
    e.preventDefault();
    var input = chatInput.value;
    if(input[0] === "/") {
	emit("evalExpression", input.slice(1));
    } else if(input[0] === "@") {
	// Extract the username from the string
	var user = input.split(" ")[0].slice(1);
	// Extract the message from the string
	var message = input.slice(user.length + 2); // @ + username + space
	emit("privateMessage", {user:user, message:message});
    } else {
	emit("chatPost", chatInput.value);
    }
    chatInput.value = "";
}


//============== LISTENERS ============================================

// Display the formatted chat post recieved from the server
ChatWindow.prototype.listen = function(router) {
    router.listen("addToChat", this.logToChat);
    //router.listen("evalResponse", this.logToConsole);
}

// Show and hide the chat window
ChatWindow.prototype.toggleChatWindow = function() {
    if(this.chatWindowHidden) {
	this.chatWindow.style.display = "inline-block";
	this.chatToggleButton.innerHTML = "Hide chat";
	this.chatWindowHidden = false;
    } else {
	this.chatWindow.style.display = "none";
	this.chatToggleButton.innerHTML = "Show chat";
	this.chatWindowHidden = true;
    }
}

ChatWindow.prototype.logToChat = function(data) {
    this.chatLog.innerHTML += "<div>" + data + "<\div>";
}


module.exports = new ChatWindow();
module.exports.hidden = chatWindowHidden;

define(["debug", "dom", "client"], function(debug, dom, client) {

var Chat = function() {};

// Display the formatted chat post recieved from the server
Chat.prototype.listen = function(router) {
    router.listen("addToChat", this.logToChat);
	router.listen("toggleChatWindow", this.toggleChatWindow);
	router.listen("chatFormSubmit", this.chatFormSubmit);
}

Chat.prototype.logToChat = function(data) {
    dom.chatLog.innerHTML += "<div>" + data + "<\div>";
}

// Show and hide the chat window
Chat.prototype.toggleChatWindow = function() {
    if(dom.chatWindowHidden) {
		dom.chatWindow.style.display = "inline-block";
		dom.chatToggleButton.innerHTML = "Hide chat";
		dom.chatWindowHidden = false;
    } else {
		dom.chatWindow.style.display = "none";
		dom.chatToggleButton.innerHTML = "Show chat";
		dom.chatWindowHidden = true;
    }
}

Chat.prototype.chatFormSubmit = function(event) {
    event.preventDefault();
    var input = dom.chatInput.value;
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
    dom.chatInput.value = "";
}

return new Chat();

});

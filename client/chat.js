/**
* Chat namespace responsible for all client-side functionality
* associated with multiplayer chat messaging during gameplay
*
* @module client/Chat
*/
define(["debug", "dom", "client"], function(debug, dom, client) {

var Chat = function() {};

/**
* Register all gui events whose action is
* impleneted within the chat namespace
*
* @param router Instance of router class
*        responsible for message handling
* @memberof module:client/Chat
*/
Chat.prototype.listen = function(router) {
    router.listen("addToChat", this.logToChat);
	router.listen("chatWindowToggle", this.toggleChatWindow);
	router.listen("chatFormSubmit", this.chatFormSubmit);
}

/**
* Display a message on the user's chat board
*
* @memberof module:client/Chat
* @param data The string to insert into the chat board
*/
Chat.prototype.logToChat = function(data) {
    dom.chatLog.innerHTML += "<div>" + data + "<\div>";
}

/**
* Show or hide the chat window.
*
* @memberof module:client/Chat
*/
Chat.prototype.toggleChatWindow = function() {
    if(dom.chatWindow.style.display === "none") {
		dom.chatWindow.style.display = "block";
		dom.chatToggleButton.innerHTML = "Hide chat";
    } else {
		dom.chatWindow.style.display = "none";
		dom.chatToggleButton.innerHTML = "Show chat";
    }
}

/**
* Relay any chat message (public or private) to the server.
* Message control is determined by parsing the input message
* from the gui
* 
* @memberof module:client/Chat
* @param event Form submit event associated with chat input
*/
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

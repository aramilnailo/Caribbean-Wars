define(["debug", "dom", "client"], function(debug, dom, client) {

var View = function() {};

View.prototype.listen = function(router) {
    router.listen("loginResponse", this.exitLoginScreen);
    router.listen("logoutResponse", this.gameScreenToLogin);
    router.listen("keyPressed", this.keyPressed);
    router.listen("keyReleased", this.keyReleased);
}

View.prototype.exitLoginScreen = function(data) {
    if(debug.view) debug.log("[View] Moving to game screen");
    if(data.success) {
	dom.loginScreen.style.display = "none";
	client.username = data.username;
	client.usertype = data.usertype;
	if (client.usertype == "editor") {
	    dom.mapEditorScreen.style.display="inline-block";
	    client.emit("getMap", null);
	} else {
	    dom.gameScreen.style.display = "inline-block";
	    client.emit("getMap", null);
	}
	dom.usernameLabel.innerHTML = data.username;
    }
}

View.prototype.gameScreenToLogin = function() {
    dom.loginScreen.style.display = "inline-block";
    dom.gameScreen.style.display = "none";
    client.username = "";
    client.usertype = "";
}

View.prototype.mapEditorScreenToLogin = function() {
    dom.loginScreen.style.display = "inline-block";
    dom.mapEditorScreen.style.display = "none";
    client.username = "";
    client.usertype = "";
}

    // If input is pressed, emit object with the key and the new state
    //srw: This does not belong in view.js
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
	else if((keycode === 90) && event.ctrlKey)
	    client.emit("keyPress", { inputId:"C-Z", state:true});
    }
}

// If input is released, emit object with the key and the new state
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
	else if((keycode === 90) && event.ctrlKey)
	    client.emit("keyPress", { inputId:"C-Z", state:false});
    }
}

return new View();

});

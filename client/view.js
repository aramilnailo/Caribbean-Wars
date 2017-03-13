define(["debug", "dom", "client", "router"], function(debug, dom, client, router) {

var View = function() {};

    
View.prototype.listen = function(routr) {
    routr.listen("loginResponse", this.exitLoginScreen);
    routr.listen("logoutResponse", this.gameScreenToLogin);
}

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
    
View.prototype.gameScreenToLogin = function() {
    dom.loginScreen.style.display = "inline-block";
    dom.gameScreen.style.display = "none";
    client.username = "";
    client.usertype = "";
    router.unlisten("keyPressed", function(event) { new View().keyPressed(event); });
    router.unlisten("keyReleased", function(event) { new View().keyReleased(event); });
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
	//else if((keycode === 90) && event.ctrlKey)
	  //  client.emit("keyPress", { inputId:"C-Z", state:true});
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
	//else if((keycode === 90) && event.ctrlKey)
	  //  client.emit("keyPress", { inputId:"C-Z", state:false});
    }
}

return new View();

});

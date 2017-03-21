/**
* View controller namespace. Provides the logic to transition between gui views.
*
* @module client/View
*/
define(["debug", "dom", "client"], function(debug, dom, client) {

var View = function() {};

var mrouter;

/**
* Registers all gui messages whose actions are
* implemented by the view controller
*
* @memberof module:client/View
* @param router The class responsible for routing
*               gui messages
*/
View.prototype.listen = function(router) {
    if (debug.view) debug.log("client/view.js: listen()");
	mrouter = router;
	router.listen("setClientInfo", this.setClientInfo);
	router.listen("setClientZoom", this.setClientZoom);
	router.listen("loginScreen", this.loginScreen);
	router.listen("sessionBrowser", this.sessionBrowser);
	router.listen("lobbyScreen", this.lobbyScreen);
	router.listen("gameScreen", this.gameScreen);
	router.listen("adminScreen", this.adminScreen);
	router.listen("mapEditorScreen", this.mapEditorScreen);
	router.listen("keyPressed", this.keyPressed);
	router.listen("keyReleased", this.keyReleased);
}


View.prototype.setClientInfo = function(data) {
	client.username = data.username;
	client.usertype = data.usertype;
	dom.usernameLabel.innerHTML = data.username;
}

View.prototype.setClientZoom = function(data) {
	client.camera.zoom = data;
}

View.prototype.loginScreen = function(data) {
	hideAll();
	show(["loginScreen"]);
    client.username = "";
    client.usertype = "";
	client.inGame = false;
}

View.prototype.sessionBrowser = function(data) {
	hideAll();
	show(["sessionBrowser", "upperMenu", "optionsMenu"]);
	client.inGame = false;
}

View.prototype.lobbyScreen = function(data) {
	hideAll();
	show(["lobbyScreen", "upperMenu", "optionsMenu"]);
	if(data.isHost) {
		show(["hostMenu", "hostLobbyButtons"]);
		hide(["lobbyButtons"]);
	} else {
		show(["lobbyButtons"]);
		hide(["hostLobbyButtons"]);
	}
	client.inGame = false;
}

View.prototype.gameScreen = function(data) {
	hideAll();
	client.emit("getGameMap", null);
	show(["gameScreen", "upperMenu", "inGameMenu", 
	"optionsMenu"]);
	if(data.isHost) show(["hostMenu"]);
	client.inGame = true;
}

View.prototype.mapEditorScreen = function(data) {
	hideAll();
	client.emit("getEditMap", {filename:"default"});
	show(["mapEditorScreen"]);
	client.inGame = false;
}

View.prototype.adminScreen = function(data) {
	hideAll();
	show(["adminScreen", "upperMenu", "optionsMenu"]);
	client.inGame = false;
}


/**
* Relays keypress to server. 
*
* @memberof module:client/View
* @param event GUI event to process as a key press.
*/
View.prototype.keyPressed = function(event) {
    // If the chat bar is not in focus
    if(dom.chatInput !== dom.document.activeElement) {
		//for compatability with firefox
		var keycode = event.which || event.keyCode;
		
		if(keycode === 68) {
		    client.emit("keyPress", { inputId:"right", state:true});	
		} else if(keycode === 83) {
		    client.emit("keyPress", { inputId:"down", state:true});
		} else if(keycode === 65) {
		    client.emit("keyPress", { inputId:"left", state:true});
		} else if(keycode === 87) {
		    client.emit("keyPress", { inputId:"up", state:true});
			
		// Camera controls
	    } else if(keycode === 37) {
			client.camera.x--;
			if(event.shiftKey) client.camera.x -= 4;
		} else if(keycode === 38) {
			client.camera.y--;
			if(event.shiftKey) client.camera.y -= 4;
		} else if(keycode === 39) {
			client.camera.x++;
			if(event.shiftKey) client.camera.x += 4;
		} else if(keycode === 40) {
			client.camera.y++;
			if(event.shiftKey) client.camera.y += 4;
		} else if(keycode === 187) {// "=/+"
			client.camera.zoom += 0.2;
		} else if(keycode === 189) {// "-/_"
			client.camera.zoom -= 0.2;
		}
		
		// Correct camera
		if(client.map) {
			if(client.camera.zoom < 0.1) client.camera.zoom = 0.1;
			if(client.camera.zoom > 3.0) client.camera.zoom = 3.0;
			if(20 / client.camera.zoom > client.map.width) {
				client.camera.zoom = 20 / client.map.width;
			}
			if(20 / client.camera.zoom > client.map.height) {
				client.camera.zoom = 20 / client.map.height;
			}
			var cam_w = 20 / client.camera.zoom;
			var cam_h = 20 / client.camera.zoom;
			if(client.camera.x < 0) client.camera.x = 0;
			if(client.camera.y < 0) client.camera.y = 0;
			if(client.camera.x > client.map.width - cam_w)
				client.camera.x = client.map.width - cam_w;
			if(client.camera.y > client.map.height - cam_h)
				client.camera.y = client.map.height - cam_h;
		}
	}
}

/**
* Relays keyrelease to server. 
*
* @memberof module:client/View
* @param event GUI event to process as a key release.
*/
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
    }
}

function hide(data) {
	for(var i in data) {
		var target = dom[data[i]];
		target.style.display = "none";
	}
}

function show(data) {
	for(var i in data) {
		var target = dom[data[i]];
		target.style.display = "block";
	}
}

function collapse(data) {
	for(var i in data) {
		var target = dom[data[i]];
		if(target.style.display === "block") {
			var message = data[i] + "Toggle";
			mrouter.route({name:message, data:null});
		}
	}
}

function expand(data) {
	for(var i in data) {
		var target = dom[data[i]];
		if(target.style.display === "none") {
			var message = data[i] + "Toggle";
			mrouter.route({name:message, data:null});
		}
	}
}

function hideAll() {
	collapse(["statsMenu", "savedGamesMenu", 
	"userMenu", "sessionMenu", "chatWindow"]);
	hide(["loginScreen", "gameScreen", "adminScreen", 
	"lobbyScreen", "sessionBrowser", "upperMenu", 
	"inGameMenu", "optionsMenu", "hostMenu"]);
}

return new View();

});

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
	
    router.listen("newGameMapResponse", this.setMap);
	router.listen("gameUpdate", this.setGameState);
}


View.prototype.setClientInfo = function(data) {
	client.username = data.username;
	client.usertype = data.usertype;
	dom.usernameLabel.innerHTML = data.username;
}

View.prototype.setClientZoom = function(data) {
	client.camera.zoom = data;
	client.camera.moved = true;
}

View.prototype.setMap = function(data) {
    if(debug.client) debug.log("client/client.js: setMap()");
    if(data.err) {
        alert(data.err);
	} else {
		client.map = data;
		client.loading = false;
	}
}

View.prototype.setGameState = function(data) {
	client.gameState = data;
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
	client.loading = true;
}

View.prototype.mapEditorScreen = function(data) {
	hideAll();
	client.emit("loadEditMap", "default");
	show(["upperMenu", "mapEditorScreen"]);
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
		
		var old_cam = {
			x:client.camera.x, 
			y:client.camera.y,
			zoom:client.camera.zoom
		};
		
		if(keycode === 68) {
		    client.emit("gameInput", {inputId:"right", state:true});	
		} else if(keycode === 83) {
		    client.emit("gameInput", {inputId:"down", state:true});
		} else if(keycode === 65) {
		    client.emit("gameInput", {inputId:"left", state:true});
		} else if(keycode === 87) {
		    client.emit("gameInput", {inputId:"up", state:true});
		} else if(keycode === 70) {
			client.emit("gameInput", {inputId:"firing", state:true});
		} else if(keycode === 82) {
			client.emit("gameInput", {inputId:"rotating", state:true});
			
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
		} else if(keycode === 187) {	// "=/+"
			client.camera.zoom += 0.2;
		} else if(keycode === 189) {	// "-/_"
			client.camera.zoom -= 0.2;
		}
		
		// Correct camera
		if(client.map) {
			if(client.camera.zoom < 0.05) client.camera.zoom = 0.05;
			if(client.camera.zoom > 3.0) client.camera.zoom = 3.0;
			if(20 / client.camera.zoom > client.map.width) {
				client.camera.zoom = 20 / client.map.width;
			}
			if(20 / client.camera.zoom > client.map.height) {
				client.camera.zoom = 20 / client.map.height;
			}
			var cam_w = Math.floor(20 / client.camera.zoom);
			var cam_h = Math.floor(20 / client.camera.zoom);
			if(client.camera.x < 0) client.camera.x = 0;
			if(client.camera.y < 0) client.camera.y = 0;
			if(client.camera.x > client.map.width - cam_w)
				client.camera.x = client.map.width - cam_w;
			if(client.camera.y > client.map.height - cam_h)
				client.camera.y = client.map.height - cam_h;
		}
		
		// Detect camera movement
		client.camera.moved = (
			client.camera.x !== old_cam.x	||
			client.camera.y !== old_cam.y ||
			client.camera.zoom !== old_cam.zoom
		);
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
	    client.emit("gameInput", {inputId:"right", state:false});	
	else if(keycode === 83)
	    client.emit("gameInput", {inputId:"down", state:false});
	else if(keycode === 65)
	    client.emit("gameInput", {inputId:"left", state:false});
	else if(keycode === 87)
	    client.emit("gameInput", {inputId:"up", state:false});
	else if(keycode === 70)
		client.emit("gameInput", {inputId:"firing", state:false});
	else if(keycode === 82)
		client.emit("gameInput", {inputId:"rotating", state:false});
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
	
	collapse(["statsMenu", "savedGamesMenu", "userMenu", 
	"sessionMenu", "savedMapsMenu", "chatWindow"]);
	
	hide(["loginScreen", "gameScreen", "adminScreen", 
	"lobbyScreen", "sessionBrowser", "mapEditorScreen",
	"upperMenu", "inGameMenu", "optionsMenu", "hostMenu"]);
}

return new View();

});

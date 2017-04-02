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

View.prototype.setMap = function(data) {
    if(debug.client) debug.log("client/client.js: setMap()");
    if(!data.err) {
		client.map = data;
		client.camera.zoom = 1.0;
		client.camera.x = 0;
		client.camera.y = 0;
		client.camera.moved = true;
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
	show(["upperMenu", "mapEditorMenu", 
	"mapEditorScreen", "optionsMenu"]);
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
		
		switch(keycode) {
			// Game input
			case 65: // a
		    	client.input.left = true;
				break;
			case 68: // d
		    	client.input.right = true;
				break;
			case 83: // s
		    	client.input.sails = false;
				break;
			case 87: // w
		    	client.input.sails = true;
				break;
			case 81: // q
				client.input.firingLeft = true;
				break;
			case 69: // e
				client.input.firingRight = true;
				break;
			case 82: // r
				client.input.anchor = !client.input.anchor;
				break;
			case 70: // f
				client.input.swap = true;
				break;
			
			// Camera controls
			case 37: // left arrow
				client.camera.x--;
				if(event.shiftKey) client.camera.x -= 4;
				break;
			case 38: // up arrow
				client.camera.y--;
				if(event.shiftKey) client.camera.y -= 4;
				break;
			case 39: // right arrow
				client.camera.x++;
				if(event.shiftKey) client.camera.x += 4;
				break;
			case 40: // down arrow
				client.camera.y++;
				if(event.shiftKey) client.camera.y += 4;
				break;
			case 187: // "=/+"
				client.camera.zoom += 0.2;
				break;
			case 189: // "-/_"
				client.camera.zoom -= 0.2;
				break;
			default:
				break;
		}
		
		// Correct camera
		if(client.map) {
			if(client.camera.zoom < 1) client.camera.zoom = 1;
			if(client.camera.zoom > 20) client.camera.zoom = 20;
			var min = Math.min(client.map.width, client.map.height);
			var cam_w = Math.floor(min / client.camera.zoom);
			var cam_h = Math.floor(min / client.camera.zoom);
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
		
		// Emit input
		client.emit("gameInput", client.input);
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
		switch(keycode) {
			case 65: // a
		    	client.input.left = false;
				break;
			case 68: // d
		    	client.input.right = false;
				break;
			case 81: // q
				client.input.firingLeft = false;
				break;
			case 69: // e
				client.input.firingRight = false;
				break;
			case 70: // f
				client.input.swap = false;
				break;
			default:
				break;
		}
		client.emit("gameInput", client.input);
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
	"sessionMenu", "savedMapsMenu", "chatWindow", "consoleWindow"]);
	
	hide(["loginScreen", "gameScreen", "adminScreen", 
	"lobbyScreen", "sessionBrowser", "mapEditorScreen",
	"upperMenu", "inGameMenu", "hostMenu", "mapEditorMenu",
	"optionsMenu"]);
}

return new View();

});

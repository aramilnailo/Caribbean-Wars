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
	router.listen("rulesEditorScreen", this.rulesEditorScreen);
    router.listen("newGameMapResponse", this.setMap);
	router.listen("gameUpdate", this.setGameState);
	router.listen("portMenu", this.portMenu);
	router.listen("hidePortMenu", this.hidePortMenu);
	
	router.listen("mainMenuToggle", this.mainMenuToggle);
	router.listen("settingsMenuToggle", this.settingsMenuToggle);
}


View.prototype.setClientInfo = function(data) {
	client.username = data.username;
	client.usertype = data.usertype;
}

View.prototype.setMap = function(data) {
    if(debug.view) debug.log("client/client.js: setMap()");
    if(data) {
		client.map = data;
		client.camera.zoom = 1.0;
		client.camera.x = 0;
		client.camera.y = 0;
		client.camera.moved = true;
		client.loading = false;
		
		dom.mapSelectButton.innerHTML = client.map.name;
	} else {
		dom.mapSelectButton.innerHTML = "None";
	}
	renderPreview();
}

View.prototype.setGameState = function(data) {
    client.gameState = data;
    client.input.queued = false;
}

View.prototype.loginScreen = function(data) {
	hideAll();
	show(["loginScreen"]);
    client.username = "";
    client.usertype = "";
}

View.prototype.sessionBrowser = function(data) {
	hideAll();
	show(["sessionBrowser", "sessionMenu", 
	"upperContainer", "lowerContainer"]);
}

View.prototype.lobbyScreen = function(data) {
	hideAll();
	show(["lobbyScreen", "upperContainer", "lowerContainer"]);
	if(data.isHost) {
		hide(["lobbyButtons"]);
		show(["hostLobbyButtons"]);
	} else {
		hide(["hostLobbyButtons"]);
		show(["lobbyButtons"]);
	}
	client.emit("getGameMap", null);
	client.loading = true;
}

View.prototype.gameScreen = function(data) {
	hideAll();
	show(["gameScreen", "upperContainer", "inGameMenu", 
	"lowerContainer"]);
	client.inGame = true;
}

View.prototype.mapEditorScreen = function(data) {
	hideAll();
	client.emit("loadEditMap", "default");
	show(["upperContainer", "mapEditorMenu", 
	"mapEditorScreen", "lowerContainer"]);
}

View.prototype.rulesEditorScreen = function(data) {
	hideAll();
	client.emit("getRuleSet", null);
	client.emit("getRuleSetList", null);
	show(["rulesEditor", "upperContainer", "lowerContainer"]);
}

View.prototype.adminScreen = function(data) {
	hideAll();
	show(["adminScreen", "upperContainer", "lowerContainer"]);
}

View.prototype.portMenu = function(data) {
	var min = Math.min(client.map.width, client.map.height);
	var cell_w = 500 / Math.floor(min / client.camera.zoom);
	var cell_h = 500 / Math.floor(min / client.camera.zoom);
	dom.portMenu.style.left = data.coords.x * cell_w + "px";
	dom.portMenu.style.top = data.coords.y * cell_h + "px";
	dom.portMenu.style.display = "block";
	dom.portMenu.innerHTML = "<div>Port Menu</div>" + 
	"<div data-name=\"ammo:" + data.ship + "\" class=\"port-option\">" + 
	"Refill Ammo</div>" +
	"<div data-name=\"repair:" + data.ship + "\" class=\"port-option\">" + 
	"Repair Ship</div>";
}

View.prototype.hidePortMenu = function(data) {
	hide(["portMenu"]);
}

View.prototype.mainMenuToggle = function(data) {
	if(dom.mainMenu.style.display === "none") {
		dom.mainMenu.style.display = "block";
		placeMenu(dom.mainMenu);
	} else {
		dom.mainMenu.style.display = "none";
		collapse(["statsMenu", "savedGamesMenu", "savedMapsMenu"]);
	}
}

View.prototype.settingsMenuToggle = function(data) {
	if(dom.settingsMenu.style.display === "none") {
		dom.settingsMenu.style.display = "block";
		placeMenu(dom.settingsMenu);
	} else {
		dom.settingsMenu.style.display = "none";
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
	"sessionMenu", "savedMapsMenu", 
	"mainMenu", "settingsMenu",
	"chatWindow", "consoleWindow"]);
	
	hide(["loginScreen", "gameScreen", "adminScreen", 
	"lobbyScreen", "sessionBrowser", "mapEditorScreen",
	"upperContainer", "inGameMenu", "mapEditorMenu",
	"lowerContainer", "rulesEditor"]);
	
	client.inGame = false;
}

function renderPreview() {
	console.log("rendering preview");
	var canvas = dom.mapPreview.getContext("2d");
	canvas.clearRect(0, 0, 275, 275);
	if(!client.map) return;
	var map = client.map.data;
	var cell_w = 275 / client.map.width;
	var cell_h = 275 / client.map.height;
	
	for(var i = 0; i < client.map.height; i++) {
		var line = map[i];
		for(var j = 0; j < client.map.width; j++) {
			var ch, color;
			if(line) ch = line.charAt(j);
		    switch(ch) {
		    	case "1": // Sand -- tan
					color = "#C19E70";
					break;
		    	case "2": // Grass -- green
					color = "#2A8C23";
					break;
				case "3": // Port -- gray
					color = "#696969";
					break;
		    	default: // Invisible
					color = null;
					break;
		    }
			if(color) {
			    canvas.fillStyle = color;
			    canvas.fillRect(
					j * cell_w, 
					i * cell_h, 
					cell_w,
					cell_h
				);
			}
		}
	}
}

function placeMenu(elem) {
	var rect = dom.upperContainer.getBoundingClientRect();
	elem.style.left = rect.right + "px";
	elem.style.top = rect.bottom + "px";
}

return new View();

});

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
        show(["sessionBrowser", "sessionMenu", "upperMenu", "optionsMenu"]);
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

View.prototype.rulesEditorScreen = function(data) {
	hideAll();
	client.emit("getRuleSet", null);
	client.emit("getRuleSetList", null);
	show(["rulesEditor", "upperMenu", "optionsMenu"]);
	client.inGame = false;
}

View.prototype.adminScreen = function(data) {
	hideAll();
	show(["adminScreen", "upperMenu", "optionsMenu"]);
	client.inGame = false;
}

View.prototype.portMenu = function(data) {
	var min = Math.min(client.map.width, client.map.height);
	var cell_w = 500 / Math.floor(min / client.camera.zoom);
	var cell_h = 500 / Math.floor(min / client.camera.zoom);
	dom.portMenu.style.left = data.x * cell_w + "px";
	dom.portMenu.style.top = data.y * cell_h + "px";
	dom.portMenu.style.display = "block";
	dom.portMenu.innerHTML = "<div>Port Menu</div>" + 
	"<div data-name=\"refill-ammo\" class=\"port-option\">" + 
	"Refill Ammo</div>";
}

View.prototype.hidePortMenu = function(data) {
	hide(["portMenu"]);
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
	"optionsMenu", "rulesEditor"]);
}

return new View();

});

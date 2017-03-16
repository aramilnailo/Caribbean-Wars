define(["debug", "dom", "client"], function(debug, dom, client) {

	var Lobby = function() {}
	
	Lobby.prototype.listen = function(router) {
		router.listen("joinGameClick", this.joinGameClick);
		router.listen("newGameClick", this.newGameClick);
		router.listen("resumeGameClick", this.resumeGameClick);
		router.listen("toggleSessionMenu", this.toggleSessionMenu);
		router.listen("sessionListResponse", this.displaySessionList);
	}

	Lobby.prototype.joinGameClick = function(data) {
		debug.log("[Lobby] joinGameClick");
		client.emit("enterGameSession", {username:client.username, usertype:client.usertype});
	}

	Lobby.prototype.newGameClick = function(data) {
		debug.log("[Lobby] newGameClick");
	}
	
	Lobby.prototype.resumeGameClick = function(data) {
		debug.log("[Lobby] resumeGameClick");
	}
	
	Lobby.prototype.toggleSessionMenu = function() {
	    if (debug.lobby) debug.log("client/lobby.js: toggleSessionMenu");
	    if(dom.sessionMenuHidden) {
		    if(debug.lobby) debug.log("toggleSessionMenu(): Show sessions");
	        client.emit("sessionListRequest", null);
			dom.sessionMenuButton.innerHTML = "Hide sessions";
			dom.sessionMenu.style.display = "block";
			dom.sessionMenuHidden = false;
	    } else {
	        if(debug.lobby) debug.log("toggleSessionMenu(): Hide sessions");
	        dom.sessionMenu.style.display = "none";	
			dom.sessionMenuButton.innerHTML = "Show sessions";
			dom.sessionMenuHidden = true;
	    }
	}

	Lobby.prototype.displaySessionList = function(data) {
		debug.log("[Lobby] displaySessionList");
		var html = "<table>" +
		"<tr>" +
		"<th>ID</th>" +
		"<th>Host</th>" +
		"<th>Map</th>" +
		"<th>Players</th>" +
		"</tr>";
		for(var i in data) {
			var host = data[i].host ? data[i].host.username : "";
			html += "<tr>" + 
			"<td>" + i + "</td>" +
			"<td>" + host + "</td>" +
			"<td>" + data[i].map + "</td>" + 
			"<td>";
			for(var j in data[i].players) {
				html += data[i].players[j].username + ", ";
			}
			html += "</td>" +
			"</tr>";
		}
		html += "</table>"
		dom.sessionList.innerHTML = html;
	}

	return new Lobby();
	
});
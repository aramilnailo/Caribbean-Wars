define(["debug", "dom", "client"], function(debug, dom, client) {

	var Lobby = function() {}
	
	Lobby.prototype.listen = function(router) {
		router.listen("joinSessionClick", this.joinSessionClick);
		router.listen("newSessionClick", this.newSessionClick);
		router.listen("sessionMenuToggle", this.toggleSessionMenu);
		router.listen("sessionListResponse", this.displaySessionList);
		
		router.listen("inviteClick", this.inviteClick);
		router.listen("kickClick", this.kickClick);
		router.listen("promoteClick", this.promoteClick);
		
		router.listen("newGameClick", this.newGameClick);
		router.listen("resumeGameClick", this.resumeGameClick);
		router.listen("endSessionClick", this.endSessionClick);
		router.listen("leaveSessionClick", this.leaveSessionClick);
		router.listen("joinInProgressClick", this.joinInProgressClick);
		router.listen("updateLobby", this.updateLobby);
	}

	Lobby.prototype.joinSessionClick = function(data) {
		debug.log("[Lobby] joinGameClick");
		var id = window.prompt("Which game session?", "0");
		if(id) {
			client.emit("enterGameSession", {username:client.username, usertype:client.usertype, id:id});
		} else {
			alert("Invalid input");
		}
	}

	Lobby.prototype.newSessionClick = function(data) {
		debug.log("[Lobby] newSessionClick");
		client.emit("newGameSession", null);
	}
	
	Lobby.prototype.toggleSessionMenu = function() {
	    if (debug.lobby) debug.log("client/lobby.js: toggleSessionMenu");
	    if(dom.sessionMenu.style.display === "none") {
		    if(debug.lobby) debug.log("toggleSessionMenu(): Show sessions");
	        client.emit("sessionListRequest", null);
			dom.sessionMenuButton.innerHTML = "Hide sessions";
			dom.sessionMenu.style.display = "block";
	    } else {
	        if(debug.lobby) debug.log("toggleSessionMenu(): Hide sessions");
	        dom.sessionMenu.style.display = "none";	
			dom.sessionMenuButton.innerHTML = "Show sessions";
	    }
	}

	Lobby.prototype.displaySessionList = function(data) {
		debug.log("[Lobby] displaySessionList");
		if(data.length === 0) {
			dom.sessionList.innerHTML = "No sessions";
			return;
		}
		var html = "<table>" +
		"<tr>" +
		"<th>ID</th>" +
		"<th>Host</th>" +
		"<th>inGame</th>" +
		"<th>Players</th>" +
		"</tr>";
		for(var i in data) {
			html += "<tr>" + 
			"<td>" + i + "</td>" +
			"<td>" + data[i].host + "</td>" +
			"<td>" + data[i].running + "</td>" + 
			"<td>";
			for(var j in data[i].users) {
				html += data[i].users[j];
				if(j < data[i].users.length - 1) {
					html += ", ";
				}
			}
			html += "</td>" +
			"</tr>";
		}
		html += "</table>"
		dom.sessionList.innerHTML = html;
	}
	
	
	Lobby.prototype.inviteClick = function(data) {
		debug.log("[Lobby] inviteClick");
	}
	
	Lobby.prototype.kickClick = function(data) {
		debug.log("[Lobby] kickClick");
		var target = window.prompt("Kick which player?", "user");
		if(target) {
			client.emit("kickUser", target);
		} else {
			alert("Invalid input");
		}
	}
	
	Lobby.prototype.promoteClick = function(data) {
		debug.log("[Lobby] promoteClick");
		var target = window.prompt("Promote which player to host?", "user");
		if(target) {
			client.emit("setHost", target);
		} else {
			alert("Invalid input");
		}
	}
	
	Lobby.prototype.newGameClick = function(data) {
		debug.log("[Lobby] newGameClick");
		var filename = window.prompt("Which map?", "map");
		if(filename) {
			client.emit("startGame", filename);
		} else {
			alert("Invalid input");
		}
	}
	
	Lobby.prototype.resumeGameClick = function(data) {
		debug.log("[Lobby] resumeGameClick");
	}

	Lobby.prototype.endSessionClick = function(data) {
		debug.log("[Lobby] endSessionClick");
		client.emit("deleteGameSession", null);
	}

	Lobby.prototype.leaveSessionClick = function(data) {
		debug.log("[Lobby] leaveSessionClick");
		client.emit("exitGameSession", null);
	}
	
	Lobby.prototype.joinInProgressClick = function(data) {
		debug.log("[Lobby] joinInProgressClick");
		client.emit("enterGame", null);
	}
	
	
	Lobby.prototype.updateLobby = function(data) {
		debug.log("[Lobby] updateLobby");
		var html = "<ul>";
		for(var i in data) {
			html += "<li>" + data[i] + "</li>";
		}
		html += "</ul>";
		dom.lobbyPlayerList.innerHTML = html;
	}
	
	return new Lobby();
	
});
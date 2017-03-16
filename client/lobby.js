define(["debug", "dom", "client"], function(debug, dom, client) {

	var Lobby = function() {}
	
	Lobby.prototype.listen = function(router) {
		router.listen("joinGameClick", this.joinGameClick);
		router.listen("newGameClick", this.newGameClick);
		router.listen("resumeGameClick", this.resumeGameClick);
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

	return new Lobby();
	
});
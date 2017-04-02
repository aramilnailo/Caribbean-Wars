
require(["client", "router", "chat", 
"stats", "login", "render", 
"saves", "view", "users", 
"lobby", "mapeditor",
"mapeditorfiles", "alerts"], 
function(client, router, chat,
	 stats, login, render, 
	saves, view, users, 
	lobby, mapeditor, 
	mapeditorfiles, alerts) {

var socket = io();
client.socket = socket;

chat.listen(router);
stats.listen(router);
render.listen(router);
saves.listen(router);
mapeditor.listen(router);
mapeditorfiles.listen(router);
view.listen(router);
login.listen(router);
users.listen(router);
lobby.listen(router);
alerts.listen(router);

mapeditor.initButtons();
	    
socket.on("message", function(message) {
	router.route(message);
});

setInterval(function() { 
	if(!client.loading && client.usertype === "editor") {
		mapeditor.drawEditScreen(); 
	}
	if(client.inGame) {
		if(!client.loading && !client.drawing) {
			if(client.gameState && client.map) {
				render.drawCamera(client.map);
				render.drawGameState({
					map:client.map, 
					state:client.gameState
				});
			}
		}
	}
}, 1000 / 30);

setInterval(function() {
	alerts.displayMessages();
}, 1000 / 10);

});


require(["client", "router", "chat", "stats", "login", "render", "saves", "view", "users", "lobby", "mapeditor","mapeditorfiles"], 
	function(client, router, chat, stats, login, render, saves, view, users, lobby, mapeditor, mapeditorfiles) {

var socket = io();
client.socket = socket;

client.listen(router);
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
	    
socket.on("message", function(message) {
	router.route(message);
});

setInterval(function() { 
	if(!client.loading && client.usertype === "editor") {
		mapeditor.drawEditScreen(); 
	}
}, 1000/30);


});

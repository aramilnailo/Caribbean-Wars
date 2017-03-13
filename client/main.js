
require(["client", "router", "chat", "stats", "login", "render", "saves", "view", "mapeditor"], 
	function(client, router, chat, stats, login, render, saves, view, mapeditor) {

var socket = io();
client.socket = socket;

client.listen(router);
chat.listen(router);
stats.listen(router);
render.listen(router);
saves.listen(router);
view.listen(router);
mapeditor.listen(router);
mapeditorsavedlist.listen(router);
login.listen(router);
	    
socket.on("message", function(message) {
	router.route(message);
});

});

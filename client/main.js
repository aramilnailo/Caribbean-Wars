require(["client", "router", "chat", "stats", "viewlogin", "render", "saves", "view"], 
	function(client, router, chat, stats, viewlogin, render, saves, view) {

var socket = io();
client.socket = socket;

client.listen(router);
chat.listen(router);
stats.listen(router);
viewlogin.listen(router);
render.listen(router);
saves.listen(router);
view.listen(router);

socket.on("message", function(message) {
	router.route(message);
});

});
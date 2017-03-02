
var debug = require("./debug.js").client;
var log = require("./debug.js").log;

//=============== MODULES =============================

var DOM = require("./dom.js");
var router = require("./router.js");
var chat = require("./chat.js");
var stats = require("./stats.js");
var login = require("./login.js");
var render = require("./render.js");
var saves = require("./saves.js");
var view = require("./view.js");

//=====================================================

var Client = function() {}

var username = "";
var mapData = {data:"", path:""};

Client.prototype.listen = function(router) {
	router.listen("collapseMenus", hideAllMenus);
	router.listen("mapData", setMap);
	router.listen("evalResponse", logToConsole);
	router.listen("alert", pushAlert);
}

Client.prototype.setMap = function(data) {
    if(data.err) {
	   alert(data.err);
    } else {
        mapData = data;
    }
}

Client.prototype.pushAlert = function(data) {
    alert(data);
}

Client.prototype.logToConsole = function(data) {
	console.log(data);
}

Client.prototype.hideAllMenus = function(data) {
	
}

Client.prototype.emit = function(message, data) {
    console.log("[Client] Emitting \"" + message + "\".");
    socket.emit("message", {name:message, data:data});
}

//=========== SERVER INTERFACE ==============================

var socket = io();

var current = new Client();

socket.on("connection", function() {
	// Set up listeners
	current.listen(router);
	chat.listen(router);
	stats.listen(router);
	login.listen(router);
	render.listen(router);
	saves.listen(router);
	view.listen(router);
});

socket.on("message", function(message) {
	router.route(message);
});


module.exports.client = current;

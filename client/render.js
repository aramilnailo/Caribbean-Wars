
var debug = require("./debug.js").render;
var log = require("./debug.js").log;

var DOM = require("./dom.js");

var Render = function() {}

Render.prototype.listen = function(router) {
	router.listen("newPositions", drawScreen);
}

Render.prototype.drawScreen = function(data) {
    var i, j, ch;
    // Clear screen
    DOM.canvas.clearRect(0, 0, 500, 500);
    // Draw the map
    for(i = 0; i < 10; i++) {
	for(j = 0; j < 10; j++) {
	    // 0 = blue, 1 = tan, 2 = green
	    ch = mapData.data[11 * i + j]; // Current cell
	    DOM.canvas.fillStyle = (ch == "0") ? "#42C5F4" :
		(ch == "1") ? "#C19E70" : "#2A8C23";
	    DOM.canvas.fillRect(j * 50, i * 50, 50, 50);
	}
    }
    // Draw the players in black
    DOM.canvas.fillStyle = "#000000";
    for(i = 0; i < data.length; i++) {
	DOM.canvas.fillText(data[i].number, data[i].x, data[i].y);
    }
}

// If input is pressed, emit object with the key and the new state
DOM.document.onkeydown = function(event) {
    // If the chat bar is not in focus
    if(DOM.chatInput !== DOM.document.activeElement) {
	if(event.keyCode === 68)
	    emit("keyPress", { inputId:"right", state:true});	
	else if(event.keyCode === 83)
	    emit("keyPress", { inputId:"down", state:true});
	else if(event.keyCode === 65)
	    emit("keyPress", { inputId:"left", state:true});
	else if(event.keyCode === 87)
	    emit("keyPress", { inputId:"up", state:true});
    }
}

// If input is released, emit object with the key and the new state
DOM.document.onkeyup = function(event) {
    if(DOM.chatInput !== DOM.document.activeElement) {
	if(event.keyCode === 68)
	    emit("keyPress", { inputId:"right", state:false});	
	else if(event.keyCode === 83)
	    emit("keyPress", { inputId:"down", state:false});
	else if(event.keyCode === 65)
	    emit("keyPress", { inputId:"left", state:false});
	else if(event.keyCode === 87)
	    emit("keyPress", { inputId:"up", state:false});
    }
}

module.exports = new Render();
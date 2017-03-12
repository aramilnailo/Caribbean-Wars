define(["debug", "dom", "client"], function(debug, dom, client) {

var log = debug.log;
    
var Render = function() {}

Render.prototype.listen = function(router) {
	router.listen("newPositions", this.drawScreen);
}

Render.prototype.drawScreen = function(data) {
    var i, j, ch;
    // Clear screen
    dom.canvas.clearRect(0, 0, 500, 500);
    // Draw the map
    //if (debug.render) log("client/render.js: client.username="+client.username);
    //if (debug.render) log("client/render.js: client.usertype="+client.usertype);
    //if(debug.render) log("client/render.js: client.map.lx="+client.map.lx);
    var ly = client.map.ly;
    var lx = client.map.lx;
    //if (debug.render) log("client/render: lx="+lx+"; ly="+ly);  
    for(i = 0; i < 10; i++) {
	for(j = 0; j < 10; j++) {
	    // 0 = blue, 1 = tan, 2 = green
	    ch = client.map.data[10 * i + j]; // Current cell
	    dom.canvas.fillStyle = (ch == "0") ? "#42C5F4" :
		(ch == "1") ? "#C19E70" : "#2A8C23";
	    dom.canvas.fillRect(j * 50, i * 50, 50, 50);
	}
    }
    // Draw the players in black
    dom.canvas.fillStyle = "#000000";
    for(i = 0; i < data.length; i++) {
	dom.canvas.fillText(data[i].number, data[i].x, data[i].y);
    }
}

return new Render();

});

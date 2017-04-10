/**
* Client input controller namespace. 
* Processes client/game interaction events.
*
* @module client/Input
*/
define(["debug", "dom", "client", "alerts"], function(debug, dom, client, alerts) {

var Input = function() {};

var CANVAS_W = 500;
var CANVAS_H = 500;
    
Input.prototype.listen = function(router) {
    if (debug.input) debug.log("client/input.js: listen()");
    router.listen("keyPressed", this.processKeyPressed);
    router.listen("keyReleased", this.processKeyReleased);
    router.listen("gameCanvasClick", this.processMouseClick);
    router.listen("gameCanvasDoubleClick", this.processMouseDoubleClick);
	router.listen("rightClick", this.handleRightClick);
}



/*
Input.prototype.processMouseDown = function(event) {
}

Input.prototype.processMouseUp = function(event) {
}
*/

var orderIncoming = false;
// same as single click, but terminate order stream
Input.prototype.processMouseDoubleClick = function(event) {
    Input.prototype.processMouseClick(event);
    orderIncoming = false;
}

Input.prototype.handleRightClick = function(event) {
	event.preventDefault();

    var rect = dom.easel.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
	console.log("Right click at " + x + ", " + y);
	
	dom.rightClickMenu.style.display = "block";
	dom.rightClickMenu.style.left = x + "px";
	dom.rightClickMenu.style.top = y + "px";
	
	// Prepare to close menu
	dom.document.onclick = function() {
		dom.rightClickMenu.style.display = "none";
	}
}

// note: left: event.which = 1, right: event.which = 3
Input.prototype.processMouseClick = function(event) {
    if (debug.input) debug.log("client/input.js: processMouseClick()");
    if (! client.inGame) return;
    if (event.which == 1) {
	// left mouse click
	if (debug.input) debug.log("client/input.js: processMouseClick; left");
	if (! orderIncoming) {
	    // erase previous orders
	    client.input.orders = [];
	}
	orderIncoming = true;
    } else {
	// right mouse click
	if (debug.input) debug.log("client/input.js: processMouseClick; right");
	orderIncoming = false;
    }
	
    var rect = dom.easel.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    /*
    var min = Math.min(client.map.width, client.map.height);
    var a = Math.round((x / 500) * Math.floor(min / client.camera.zoom)) + client.camera.x;
    var b = Math.round((y / 500) * Math.floor(min / client.camera.zoom)) + client.camera.y;
    */

    var cam_x = client.camera.x;
    var cam_y = client.camera.y;
    var min = Math.min(client.map.width, client.map.height);
    var cam_w = Math.floor(min / client.camera.zoom);
    var cam_h = Math.floor(min / client.camera.zoom);
    // cell dimensions in pixels
    var cell_w = CANVAS_W / cam_w;
    var cell_h = CANVAS_H / cam_h;
    var a = x/cell_w + cam_x;
    var b = y/cell_h + cam_y;
    
    var ships = client.gameState.ships;
    if (debug.input) debug.log("input.js: myShip = "+client.gameState.myShip);
    for (var s in ships) {
	// need to verify somehow that ships[s] is not current ship.
	if (debug.input) {
	    //debug.log("ship "+s+": alive="+ships[s].alive);
	    /*debug.log("ship "+s+":"
		      +" (" + ships[s].box.verts[0].x+","
		      +ships[s].box.verts[0].y+")"
		      +" (" + ships[s].box.verts[1].x+","
		      +ships[s].box.verts[1].y+")"
		      +" (" + ships[s].box.verts[3].x+","
		      +ships[s].box.verts[3].y+")"
		      +" (" + ships[s].box.verts[2].x+","
		      +ships[s].box.verts[2].y+")"
		      +" (" + ships[s].box.verts[4].x+","
		      +ships[s].box.verts[4].y+")");
	*/
	    if (inside(ships[s],a,b)) debug.log("input.js: inside ship "+s);
	    else debug.log("input.js: outside ship "+s);

	}

	
	if (s != client.gameState.myShip && inside(ships[s],a,b)) {
	    // select:name = ram, name = fireOn, name = board
	    alerts.showPrompt("f:follow, r:ram, b:board, s:fireAt", function(resp) {
		if (resp === "f" || resp === "F") {
		    client.input.orders.push({name:"f",ship:ships[s]});
		} else if (resp === "r" || resp === "R") {
		    client.input.orders.push({name:"r",ship:ships[s]});
		} else if (resp === "b" || resp === "B") {
		    client.input.orders.push({name:"b",ship:ships[s]});
		}
		if (debug.input) debug.log("client/input.js: processMouseClick; order="+JSON.stringify(client.input.orders));
		client.emit("gameInput",client.input);
		return;
	    });
	}
    }
    
    // TODO target docks
    
    // default: position
    // only push if a,b is over water.
    console.log("input: a="+a+" b="+b);
    console.log("input: cam_w="+cam_w+" cam_h="+cam_h);
    console.log("input: cell_w="+cell_w+" cell_h="+cell_h);
    console.log("input: x="+x+" y="+y);
    if (client.map.data[Math.floor(b)].charAt(Math.floor(a)) === "0") {
	client.input.orders.push({name:"xy",x:a,y:b});
	if (debug.input) debug.log("client/input.js: processMouseClick; order="+JSON.stringify(client.input.orders));
	client.emit("gameInput",client.input);
    } else {
	console.log("mouseover not over water but: "+ client.map.data[Math.floor(b)].charAt(Math.floor(a)));
    }
}

/*
Input.prototype.processMouseMove = function(event) {
}
*/

Input.prototype.processKeyPressed = function(event) {
    // If the chat bar is not in focus
    if(dom.chatInput !== dom.document.activeElement) {
	//for compatability with firefox
	var keycode = event.which || event.keyCode;

	var old_cam = {
	    x:client.camera.x,
	    y:client.camera.y,
	    zoom:client.camera.zoom
	};

	switch(keycode) {
	    // Game input
	case 65: // a
	    client.input.left = true;
	    break;
	case 68: // d
	    client.input.right = true;
	    break;
	case 83: // s
	    if (debug.input) debug.log("input.js: sails -> false");
	    client.input.sails = false;
	    break;
	case 87: // w
	    if (debug.input) debug.log("input.js: sails -> true");
	    client.input.sails = true;
	    break;
	case 81: // q
	    client.input.firingLeft = true;
	    break;
	case 69: // e
	    client.input.firingRight = true;
	    break;
	case 82: // r
	    client.input.anchor = !client.input.anchor;
	    break;
	case 70: // f
	    client.input.swap = true;
	    break;
	case 32: //space bar
	    orderIncoming = false;
	    break;
	    
	    // Camera controls
	case 37: // left arrow
	    client.camera.x--;
	    if(event.shiftKey) client.camera.x -= 4;
	    break;
	case 38: // up arrow
	    client.camera.y--;
	    if(event.shiftKey) client.camera.y -= 4;
	    break;
	case 39: // right arrow
	    client.camera.x++;
	    if(event.shiftKey) client.camera.x += 4;
	    break;
	case 40: // down arrow
	    client.camera.y++;
	    if(event.shiftKey) client.camera.y += 4;
	    break;
	case 187: // "=/+"
	    client.camera.zoom += 0.2;
	    break;
	case 189: // "-/_"
	    client.camera.zoom -= 0.2;
	    break;
	default:
	    break;
	}

	// Correct camera
	if(client.map) {
	    if(client.camera.zoom < 1) client.camera.zoom = 1;
	    if(client.camera.zoom > 20) client.camera.zoom = 20;
	    var min = Math.min(client.map.width, client.map.height);
	    var cam_w = Math.floor(min / client.camera.zoom);
	    var cam_h = Math.floor(min / client.camera.zoom);
	    if(client.camera.x < 0) client.camera.x = 0;
	    if(client.camera.y < 0) client.camera.y = 0;
	    if(client.camera.x > client.map.width - cam_w)
		client.camera.x = client.map.width - cam_w;
	    if(client.camera.y > client.map.height - cam_h)
		client.camera.y = client.map.height - cam_h;
	}

	// Detect camera movement
	client.camera.moved = (
	    client.camera.x !== old_cam.x   ||
		client.camera.y !== old_cam.y ||
		client.camera.zoom !== old_cam.zoom
	);

	// Emit input
	client.emit("gameInput", client.input);
    }

}
	
Input.prototype.processKeyReleased = function(event) {

    if(dom.chatInput !== dom.document.activeElement) {
	var keycode = event.which || event.keyCode;
	switch(keycode) {
	case 65: // a
	    client.input.left = false;
	    break;
	case 68: // d
	    client.input.right = false;
	    break;
	case 81: // q
	    client.input.firingLeft = false;
	    break;
	case 69: // e
	    client.input.firingRight = false;
	    break;
	case 70: // f
	    client.input.swap = false;
	    break;
	default:
	    break;
	}
	client.emit("gameInput", client.input);
    }
}


//winding number algorithm
// assumes convex ship box
function inside(ship,x,y) {

    var verts = ship.box.verts;
    var ax = verts[0].x - x;
    var ay = verts[0].y - y;
    var bx = verts[1].x - x;
    var by = verts[1].y - y;
    var sign = (ax*by < ay*bx) ? true : false;
    //if (debug.input) debug.log("inside: ax,ay,bx,by = "+ax+","+ay+","+bx+","+by);
    //if (debug.input) debug.log("inside: sign="+sign);


    ax = verts[1].x - x;
    ay = verts[1].y - y;
    bx = verts[3].x - x;
    by = verts[3].y - y;
    //if (debug.input) debug.log("inside: 1,3 ax*by-ay*bx="+(ax*by-ay*bx));
    if ((ax*by < ay*bx) !== sign) return false;
    //ax = bx;
    //ay = by;

    ax = verts[3].x - x;
    ay = verts[3].y - y;
    bx = verts[2].x - x;
    by = verts[2].y - y;
    //if (debug.input) debug.log("inside: 3,2 ax*by-ay*bx="+(ax*by-ay*bx));
    
    if ((ax*by < ay*bx) !== sign) return false;
    //ax = bx;
    //ay = by;

    ax = verts[2].x - x;
    ay = verts[2].y - y;
    bx = verts[4].x - x;
    by = verts[4].y - y;
    //if (debug.input) debug.log("inside: 2,4 ax*by-ay*bx="+(ax*by-ay*bx));
    if ((ax*by < ay*bx) !== sign) return false;
    //ax = bx;
    //ay = by;

    ax = verts[4].x - x;
    ay = verts[4].y - y;
    bx = verts[0].x - x;
    by = verts[0].y - y;
    //if (debug.input) debug.log("inside: 4,0 ax*by-ay*bx="+(ax*by-ay*bx));
    if ((ax*by < ay*bx) !== sign) return false;
    
    return true;

}

return new Input();
    
});

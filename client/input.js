/**
* Client input controller namespace. 
* Processes client/game interaction events.
*
* @module client/Input
*/
define(["debug", "dom", "client", "alerts", "router"], 
function(debug, dom, client, alerts, router) {

var log = debug.log;
var debug = debug.input;

var Input = function() {};

var CANVAS_W = 500;
var CANVAS_H = 500;

var orderIncoming = false;
    
Input.prototype.listen = function(mrouter) {
    if (debug.input) debug.log("client/input.js: listen()");
    mrouter.listen("keyPressed", this.processKeyPressed);
    mrouter.listen("keyReleased", this.processKeyReleased);
    mrouter.listen("leftClick", this.processLeftClick);
	mrouter.listen("rightClick", this.processRightClick);
    mrouter.listen("doubleClick", this.processDoubleClick);
}

Input.prototype.processLeftClick = function(event) {
	var rel_coords = getRelCoords(event);
	// Print info
	if(debug) {
		if(rel_coords.elem.id) log("Left click at " + rel_coords.x + ", " + 
		rel_coords.y + " on element " + rel_coords.elem.id);
		else if(rel_coords.elem.className) log("Left click at " + rel_coords.x + ", " + 
		rel_coords.y + " on element of class " + rel_coords.elem.className);
	}
	// Click off right click menu if needed
	if(rel_coords.elem !== dom.rightClickMenu &&
		rel_coords.elem.className !== "orders" &&
		rel_coords.elem.className !== "rule-set-option" &&
		dom.rightClickMenu.style.display !== "none") {
		dom.rightClickMenu.style.display = "none";
		return;
	}
	// Check if clicking the game screen
	if(rel_coords.elem === dom.easel) {
		var c_coords = getCellCoords(rel_coords);
		var ship = shipAtCoords(c_coords);
		if(ship) {
			// If ship is clicked, select/deselect it
			select(ship.name);
		} else {
			// Direct selected ships to x y coordinates
			navigate(c_coords);
		}
	} else if(rel_coords.elem.className === "orders") {
		// Direct selected ships to carry out clicked order
		var orderText = rel_coords.elem.getAttribute("data-name");
		issueOrder(orderText);
		dom.rightClickMenu.style.display = "none";
	} else if(rel_coords.elem.className === "rule") {
		// Show rule set editor input
		var ruleName = rel_coords.elem.getAttribute("data-name");
		alerts.showPrompt(ruleName + ": ", function(resp) {
			router.route({
				name:"ruleInput", 
				data:{
					name:ruleName,
					value:resp
				}
			});
		});
	} else if(rel_coords.elem.className === "rule-set-option") {
		// Fire the proper onclick function
		var optionName = rel_coords.elem.getAttribute("data-name");
		var parsedOption = optionName.split("-");
		if(parsedOption[0] === "delete")
			router.route({name:"deleteRuleSetClick", data:parsedOption[1]});
	}
}

Input.prototype.processRightClick = function(event) {
	var coords = getAbsCoords(event);
	var rel_coords = getRelCoords(event);
	// Print info
	if(debug) {
		if(rel_coords.elem.id) log("Right click at " + rel_coords.x + ", " + 
		rel_coords.y + " on element " + rel_coords.elem.id);
		else if(rel_coords.elem.className) log("Right click at " + rel_coords.x + ", " + 
		rel_coords.y + " on element of class " + rel_coords.elem.className);
	}
	// Check if clicking the game screen
	if(rel_coords.elem === dom.easel || rel_coords.elem.className === "rule-set") {
		event.preventDefault();
		dom.rightClickMenu.style.display = "block";
		dom.rightClickMenu.style.left = coords.x + "px";
		dom.rightClickMenu.style.top = coords.y + "px";
		dom.rightClickMenu.innerHTML = "";
		if(rel_coords.elem === dom.easel) {
			var ship = shipAtCoords(getCellCoords(rel_coords));
			if(ship) {
				var html = "";
				html += "<div class=\"orders\" data-name=\"fire:" + ship.name + "\">Fire</div>";
				html += "<div class=\"orders\" data-name=\"follow:" + ship.name + "\">Follow</div>";
				html += "<div class=\"orders\" data-name=\"ram:" + ship.name + "\">Ram</div>";
				html += "<div class=\"orders\" data-name=\"board:" + ship.name + "\">Board</div>";
				// Add new orders here
				dom.rightClickMenu.innerHTML = html;
			}
		} else {
			var html = "<div class=\"rule-set-option\"" + 
			"data-name=\"delete-" + rel_coords.elem.getAttribute("data-name") + 
			"\">Delete</div>";
			dom.rightClickMenu.innerHTML = html;
		}
	}
}

// same as single click, but terminate order stream
Input.prototype.processDoubleClick = function(event) {
	var coords = getAbsCoords(event);
	if(debug) log("Double click at " + coords.x + ", " + coords.y);
    Input.prototype.processLeftClick(event);
	if(client.inGame) orderIncoming = false;
}


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
	default:
	    break;
	}
	client.emit("gameInput", client.input);
    }
}

// Returns the x y coordinates of the event
// relative to the entire document
function getAbsCoords(event) {
    return {
		x:event.clientX - pageXOffset,
		y:event.clientY - pageYOffset
	};
}

// Returns the x y coordinates of the event
// relative to the most nested element it
// occurred within
function getRelCoords(event) {
	var elem = dom.document.elementFromPoint(event.clientX, event.clientY);
    var rect = elem.getBoundingClientRect();
    return {
		x:event.clientX - rect.left,
		y:event.clientY - rect.top,
		elem:elem
	};
}

// Transforms pixel coordinates to cell coordinates
function getCellCoords(coords) {
	var min = Math.min(client.map.width, client.map.height);
	return {
		x:Math.round((coords.x / CANVAS_W) * Math.floor(min / client.camera.zoom)) + client.camera.x,
		y:Math.round((coords.y / CANVAS_H) * Math.floor(min / client.camera.zoom)) + client.camera.y
	};
}

// Detects and returns any ship at the given cell coordinates
function shipAtCoords(coords) {
	if(!client.inGame) return;
	for(var i in client.gameState.ships) {
		var s = client.gameState.ships[i];
		var val = Math.max(s.box.w, s.box.h);
		if(s.box.x + val > coords.x && s.box.x - val < coords.x &&
		s.box.y + val > coords.y && s.box.y - val < coords.y) {
			return s;
		}
	}
	return null;
}

function select(shipName) {
	if(debug) log("Clicked ship " + shipName);
	client.emit("selectShip", shipName);
}

function navigate(coords) {
	if(debug) log("Navigating to " + coords.x + ", " + coords.y);
	client.input.orders.push({name:"goto", coords:coords});
}

function issueOrder(orderText) {
	var order = orderText.split(":")[0];
	var target = orderText.split(":")[1];
	if(debug) log("Issuing \"" + order + "\" order on target \"" + target + "\"");
	client.input.orders.push({name:order, target:target});
}

return new Input();
    
});

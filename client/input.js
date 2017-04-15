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
	routeLeftClick(rel_coords);
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
	
	routeRightClick(rel_coords, coords);
}

// same as single click, but terminate order stream
Input.prototype.processDoubleClick = function(event) {
	var coords = getAbsCoords(event);
	if(debug) log("Double click at " + coords.x + ", " + coords.y);
    Input.prototype.processLeftClick(event);
    //client.emit("gameInput", client.input);
	if(client.inGame) orderIncoming = false;
}


Input.prototype.processKeyPressed = function(event) {
    // If the chat bar is not in focus
    if(dom.chatInput === dom.document.activeElement) return;
	//for compatability with firefox
	var keycode = event.which || event.keyCode;
	
	// Save camera position
	backupCamera();
	
	switch(keycode) {
		// Game input
		case 65: // a
			client.input.left = true;
			break;
		case 68: // d
			client.input.right = true;
			break;
		case 81: // q
			client.input.firingLeft = true;
			break;
		case 69: // e
			client.input.firingRight = true;
			break;
		case 32: //space bar
			orderIncoming = false;
			client.emit("clearShipOrders",null);
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
	
	// Correct camera position
	correctCamera();
	
	// Emit input
	client.emit("gameInput", client.input);
}
	
Input.prototype.processKeyReleased = function(event) {
	if(dom.chatInput === dom.document.activeElement) return;
	var keycode = event.which || event.keyCode;
	switch(keycode) {
		case 65: // a
			client.input.left = false;
			break;
		case 68: // d
			client.input.right = false;
			break;
		case 83: // s
			if(!client.input.oars) {
				client.input.oars = true;
				client.input.sails = false;
			} else {
				client.input.oars = false;
			}
			break;
		case 87: // w
			if(!client.input.sails) {
				client.input.sails = true;
				client.input.oars = false;
			} else {
				client.input.sails = false;
			}
			break;
		case 81: // q
			client.input.firingLeft = false;
			break;
		case 69: // e
			client.input.firingRight = false;
			break;
		case 70: // f
			client.emit("selectShip", selectNextShip());
			break;
		case 82: // r
			client.input.anchor = !client.input.anchor;
			break;
		default:
			break;
	}
	client.emit("gameInput", client.input);
}

// Detects when selected ship is outside of 
// the center of the camera, and adjusts
Input.prototype.cameraTrackShip = function() {
	var ship = client.gameState.ships.find(function(s) {
		return s.selected;
	});
	if(ship) {
		backupCamera();
		
		var min = Math.min(client.map.width, client.map.height);
		var cam_dim = Math.floor(min / client.camera.zoom);
		
		var x = ship.box.x, y = ship.box.y;
		
		var x_low_bound = client.camera.x + 0.4 * cam_dim,
		x_upp_bound = client.camera.x + 0.6 * cam_dim;
		
		var y_low_bound = client.camera.y + 0.4 * cam_dim,
		y_upp_bound = client.camera.y + 0.6 * cam_dim;
		
		var diff;
		if(x > x_upp_bound) {
			diff = x - x_upp_bound;
			client.camera.x += 0.1 * diff;
		} else if(x < x_low_bound) {
			diff = x - x_low_bound;
			client.camera.x += 0.1 * diff;
		}
		if(y > y_upp_bound) {
			diff = y - y_upp_bound;
			client.camera.y+=0.1 * diff;
		} else if(y < y_low_bound) {
			diff = y - y_low_bound;
			client.camera.y+=0.1 * diff;
		}
		
		correctCamera();
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
        client.emit("pushShipOrder",{name:"goto", coords:coords});
}

function issueOrder(orderText) {
	var order = orderText.split(":")[0];
	var target = orderText.split(":")[1];
        if(debug) log("Issuing \"" + order + "\" order on target \"" + target + "\"");
         client.emit("pushShipOrder",{name:order,target:target});
	//client.input.orders.push({name:order, target:target});
}

function backupCamera() {
	client.camera.prev.x = client.camera.x;
	client.camera.prev.y = client.camera.y;
	client.camera.prev.zoom = client.camera.zoom;
}

// Fix camera bounds
function correctCamera() {
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
		// Detect camera movement
		client.camera.moved = (
			client.camera.x !== client.camera.prev.x   ||
			client.camera.y !== client.camera.prev.y ||
			client.camera.zoom !== client.camera.prev.zoom
		);
	}
}

function selectNextShip() {
	var ships = client.gameState.ships;
	var current = ships.find(function(s) {
		return s.selected;
	});
	var index = ships.indexOf(current);
	if(++index >= ships.length) index = 0;
	return ships[index].name;
}

function routeLeftClick(rel_coords) {
	var elem = rel_coords.elem;
	// Click off right click menu if needed
	if(elem !== dom.rightClickMenu &&
		elem.className !== "orders" &&
		elem.className !== "rule-set-option" &&
		dom.rightClickMenu.style.display !== "none") {
		dom.rightClickMenu.style.display = "none";
	}
	// Check if clicking the game screen
	else if(elem === dom.easel) gameScreenClick({x:rel_coords.x, y:rel_coords.y});
	else if(elem.className === "orders") ordersClick(elem);
	else if(elem.className === "rule") ruleClick(elem);
	else if(elem.className === "rule-set-option") ruleSetOptionClick(elem);
	else if(elem.className === "port-option") portOptionClick(elem);
}

function routeRightClick(rel_coords, abs_coords) {
	// Check if clicking the game screen
	if(rel_coords.elem === dom.easel || 
		rel_coords.elem.className === "rule-set") {
		// Show right click menu
		event.preventDefault();
		dom.rightClickMenu.style.display = "block";
		dom.rightClickMenu.style.left = abs_coords.x + "px";
		dom.rightClickMenu.style.top = abs_coords.y + "px";
		dom.rightClickMenu.innerHTML = "";
		if(rel_coords.elem === dom.easel) {
			var ship = shipAtCoords(getCellCoords(rel_coords));
			if(ship) {
				// Display order options
				var html = "";
				html += "<div class=\"orders\" data-name=\"fire:" + ship.name + "\">Fire</div>";
				html += "<div class=\"orders\" data-name=\"follow:" + ship.name + "\">Follow</div>";
				html += "<div class=\"orders\" data-name=\"ram:" + ship.name + "\">Ram</div>";
				html += "<div class=\"orders\" data-name=\"board:" + ship.name + "\">Board</div>";
				// Add new orders here
				dom.rightClickMenu.innerHTML = html;
			}
		} else {
			// Display rule set options
			var html = "<div class=\"rule-set-option\"" + 
			"data-name=\"delete-" + rel_coords.elem.getAttribute("data-name") + 
			"\">Delete</div>";
			// Add new rule set options here
			dom.rightClickMenu.innerHTML = html;
		}
		
	}
}

function gameScreenClick(coords) {
	var c_coords = getCellCoords(coords);
	var ship = shipAtCoords(c_coords);
	if(ship) {
		// If ship is clicked, select/deselect it
		select(ship.name);
	} else {
		// Direct selected ships to x y coordinates
		navigate(c_coords);
	}
}

function ordersClick(element) {
	// Direct selected ships to carry out clicked order
	var orderText = element.getAttribute("data-name");
	orderIncoming = true;
    issueOrder(orderText);
	dom.rightClickMenu.style.display = "none";
}

function ruleClick(element) {
	// Show rule set editor input
	var ruleName = element.getAttribute("data-name");
	alerts.showPrompt(ruleName + ": ", function(resp) {
		router.route({
			name:"ruleInput", 
			data:{
				name:ruleName,
				value:resp
			}
		});
	});
}

function ruleSetOptionClick(element) {
	// Fire the proper onclick function
	var optionName = element.getAttribute("data-name");
	var parsedOption = optionName.split("-");
	if(parsedOption[0] === "delete")
		router.route({name:"deleteRuleSetClick", data:parsedOption[1]});
}

function portOptionClick(element) {
	var optionName = element.getAttribute("data-name");
	if(optionName === "refill-ammo") client.emit("portInput", null);	
}


return new Input();
    
});

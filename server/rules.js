var debug = require("./debug.js").rules;
var log = require("./debug.js").log;

var dbi = require("./dbi.js");
var server = require("./server.js");

var Rules = function() {}
	
Rules.prototype.listen = function(router) {
	router.listen("saveRuleSet", this.saveRuleSet);
	router.listen("loadRuleSet", this.loadRuleSet);
	router.listen("deleteRuleSet", this.deleteRuleSet);
	router.listen("getRuleSetList", this.getRuleSetList);
}
	
// Returns default ruleset object
Rules.prototype.getDefault = function() {
	var ruleset = {
		gameCapacity:8,  	// Number of players allowed in one game
		lobbyCapacity:8, 	// Number of clients allowed in this session
		inviteOnly:false,	// Whether new clients can join without host invite
		
		shipHealth:100,  		// Health points for a new ship
		shipAmmo:20,			// Num cannonballs provided to a new ship
		shipMaxAmmo:100,		// Num extra cannonballs any ship can hold
		
		shipCannons:20,  		// Default number of cannons on ship
		shipFirepower:1.5,		// Default ship firepower
		shipReloadRate:0.3,		// Default ship reload rate
		shipFiringRate:0.2,		// Default ship rate of fire
		
		maxShipSpeed:1,			// Max speed for any ship
		rowSpeed:0.2,		// Speed at which ships row
		
		projectileRange:20, 	// Distance a live projectile will travel
		
		resourceHealth:1,		// Health points for new resource barrel
		resourceAmount:10,		// Amount of resource in each barrel
		
		friendlyFire:true,		// Whether player can hit his own ships
		
		portAmmo:20,			// How much ammo ports give ships
		portRepair:50			// How much health ports give ships
	};
	
	return ruleset;
};

Rules.prototype.saveRuleSet = function(param) {
	var author = param.client.username;
	var filename = param.data.filename;
	var data = param.data.ruleset;
	dbi.addRuleSet(filename, author, data, function(resp) {
		if(resp) {
			server.emit(param.client.socket, "alert", "Saved " + filename);
			pushRuleSetList(param.clients);
		} else {
			server.emit(param.client.socket, "alert", "Could not save " + filename);
		}
	});
}

Rules.prototype.loadRuleSet = function(param) {
	var filename = param.data;
	dbi.getRuleSet(filename, function(data) {
		if(data) {
			server.emit(param.client.socket, "ruleSetResponse", data);
			server.emit(param.client.socket, "alert", "Loaded " + filename);
		} else {
			server.emit(param.client.socket, "alert", "Could not load " + filename);
		}
	});
}

Rules.prototype.deleteRuleSet = function(param) {
	var filename = param.data;
	var author = param.client.username;
	dbi.removeRuleSet(filename, author, function(resp) {
		if(resp) {
			server.emit(param.client.socket, "alert", "Deleted " + filename);
			pushRuleSetList(param.clients);
		} else {
			server.emit(param.client.socket, "alert", "Could not delete " + filename);
		}
	});
}

Rules.prototype.getRuleSetList = function(param) {
	dbi.getRuleSetList(function(data) {
		if(data) {
			server.emit(param.client.socket, "ruleSetListResponse", data);
		}
	});
}

function pushRuleSetList(clients) {
	dbi.getRuleSetList(function(data) {
		if(data) {
			for(var i in clients) {
				var c = clients[i];
				server.emit(c.socket, "ruleSetListResponse", data);
			}
		}
	});
}

module.exports = new Rules();
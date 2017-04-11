
var Rules = function() {}
	
// Returns default ruleset object
Rules.prototype.getDefault = function() {
	var ruleset = {
		gameCapacity:8,  	// Number of players allowed in one game
		lobbyCapacity:8, 	// Number of clients allowed in this session
		
		shipHealth:100,  		// Health points for a new ship
		shipAmmo:20,			// Num cannonballs provided to a new ship
		shipCannons:20,  		// Default number of cannons on ship
		shipFirepower:1.5,		// Default ship firepower
		shipReloadRate:0.3,		// Default ship reload rate
		shipFiringRate:1,		// Default ship rate of fire
		
		projectileRange:20, 	// Distance a live projectile will travel
		
		resourceHealth:1,		// Health points for new resource barrel
		resourceAmount:10		// Amount of resource in each barrel
		
	};
	
	return ruleset;
};

module.exports = new Rules();
/**
* Namespace to govern usage statistics
* acquisition, display, and management
*
* @module client/Stats
*/
define(["debug", "dom", "client"], function(debug, dom, client) {

var Stats = function() {};


/**
* Register all gui actions associated
* with usage statistics and provided by
* this class
*
* @memberof module:client/Stats
* @param router The class that manages listen requests
*/
Stats.prototype.listen = function(router) {
	router.listen("statsMenuResponse", this.displayStatsMenu);
	router.listen("statsMenuToggle", this.toggleStatsMenu);	
	router.listen("clearStatsClick", this.clearStatsClick);
}

/**
* Show and hide the stats menu
*
* @memberof module:client/Stats
*/
Stats.prototype.toggleStatsMenu = function() {
    if(dom.statsMenu.style.display === "none") {
		client.emit("statsMenuRequest", null);
		dom.statsMenu.style.display = "block";
		dom.statsMenuButton.innerHTML = "Hide stats";
    } else {
		dom.statsMenu.style.display = "none";
		dom.statsMenuButton.innerHTML = "Show stats";
    }
}

/**
* Formats statistics data into html and inserts 
* into the current window
*
* @memberof module:client/Stats
* @param data List of statistics to be displayed;
*             each element is currently assumed to be
*             of the form:
*             {username:<string>,
*              seconds_played:<int>,
*              shots_fired:<int>,
*              distance_sailed:<float>,
*              ships_sunk:<int>,
*              ships_lot:<int>}
*              
*/
Stats.prototype.displayStatsMenu = function(data) {
    var i;
    var html = "<table>" +
	"<tr>" +
	"<th>Username</th>" +
	"<th>Seconds Played</th>" +
	"<th>Shots Fired</th>" +
	"<th>Distance Sailed</th>" +	
	"<th>Ships Sunk</th>" +
	"<th>Ships Lost</th>" +
	"</tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].username + "</td>" +
	    "<td>" + data[i].seconds_played + "</td>" +
	    "<td>" + data[i].shots_fired + "</td>" +
	    "<td>" + data[i].distance_sailed + "</td>" +
	    "<td>" + data[i].ships_sunk + "</td>" +
	    "<td>" + data[i].ships_lost + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    dom.statsList.innerHTML = html;
}

/**
* Deletes all statistics for the current user from 
* the database.
* @memberof module:client/Stats
*/
Stats.prototype.clearStatsClick = function() {
	if(debug.client) debug.log(client.username);
	client.emit("clearStats", client.username);
}

return new Stats();

});

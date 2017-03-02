
var debug = require("./debug.js").stats;
var log = require("./debug.js").log;

var DOM = require("./dom.js");
var client = require("./client.js");

var Stats = function() {}

Stats.prototype.listen = function(router) {
	router.listen("statsMenuResponse", displayStatsMenu);	
}

// Show and hide the stats menu
Stats.prototype.toggleStatsMenu = function() {
    if(DOM.statsMenuHidden) {
		client.emit("statsMenuRequest", null);
		DOM.statsMenu.style.display = "inline-block";
		DOM.statsMenuButton.innerHTML = "Hide stats";
		DOM.statsMenuHidden = false;
    } else {
		DOM.statsMenu.style.display = "none";
		DOM.statsMenuButton.innerHTML = "Show stats";
		DOM.statsMenuHidden = true;
    }
}

Stats.prototype.displayStatsMenu = function(data) {
    var i;
    DOM.statsMenu.style.display = "table";
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
    DOM.statsMenu.innerHTML = html;
}

// Show stats button is clicked
DOM.statsMenuButton.onclick = function() {
    toggleStatsMenu();
}

module.exports = new Stats();

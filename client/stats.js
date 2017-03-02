define(["debug", "dom", "client"], function(debug, dom, client) {

var Stats = function() {}

Stats.prototype.listen = function(router) {
	router.listen("statsMenuResponse", this.displayStatsMenu);
	router.listen("toggleStatsMenu", this.toggleStatsMenu);	
}

// Show and hide the stats menu
Stats.prototype.toggleStatsMenu = function() {
    if(dom.statsMenuHidden) {
		client.emit("statsMenuRequest", null);
		dom.statsMenu.style.display = "inline-block";
		dom.statsMenuButton.innerHTML = "Hide stats";
		dom.statsMenuHidden = false;
    } else {
		dom.statsMenu.style.display = "none";
		dom.statsMenuButton.innerHTML = "Show stats";
		dom.statsMenuHidden = true;
    }
}

Stats.prototype.displayStatsMenu = function(data) {
    var i;
    dom.statsMenu.style.display = "table";
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
    dom.statsMenu.innerHTML = html;
}

return new Stats();

});

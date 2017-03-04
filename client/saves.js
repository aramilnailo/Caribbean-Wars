define(["debug", "dom", "client"], function(debug, dom, client) {


/**
*
*/
var Saves = function() {};

/**
*
*/
Saves.prototype.listen = function(router) {
	router.listen("savedGamesListResponse", this.displaySavedGamesMenu);
	router.listen("toggleSavedGamesMenu", this.toggleSavedGamesMenu);
	router.listen("saveGameClick", this.saveGameClick);
	router.listen("loadGameClick", this.loadGameClick);
	router.listen("deleteGameClick", this.deleteGameClick);
}

// Show and hide the saved game menu
/**
*
*/
Saves.prototype.toggleSavedGamesMenu = function() {
    if(dom.savedGamesMenuHidden) {
		client.emit("savedGamesListRequest", null);
		dom.savedGamesMenuButton.innerHTML = "Hide saved games";
		dom.savedGamesMenuHidden = false;
    } else {
		dom.savedGamesMenu.style.display = "none";
		dom.savedGamesMenuButton.innerHTML = "Show saved games";
		dom.savedGamesMenuHidden = true;
    }
}

/**
*
*/
Saves.prototype.displaySavedGamesMenu = function(data) {
// Format the saved_games table into HTML
    var i;
    var html = "<table>" +
	"<tr>" +
	"<th>Host</th>" +
	"<th>File Name</th>" +
	"<th>Map</th>" +
	"</tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].author+"</td>" +
	    "<td>" + data[i].file_name + "</td>" +
	    "<td>" + data[i].map_file_path + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    dom.savedGamesList.innerHTML = html;
    // Make the saved games screen visible
    dom.savedGamesMenu.style.display = "inline-block";
}

/**
*
*/
Saves.prototype.saveGameClick = function() {
    var filename = window.prompt("Save as: ","filename");
    if(filename) {
        client.emit("saveGameRequest",
            {file_name:filename, author:username,
             map_file_path:mapData.path});
    }
}

/**
*
*/
Saves.prototype.loadGameClick = function() {
    var filename = window.prompt("Load game:", "filename");
    if(filename) {
        client.emit("loadNewMap", {filename:filename, username:username});
    }
}

/**
*
*/
Saves.prototype.deleteGameClick = function() {
    var filename = window.prompt("Delete game:", "filename");
    if(filename) {
        client.emit("deleteSavedGame", filename);
    }
}

return new Saves();

});

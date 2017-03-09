define(["debug", "dom", "client"], function(debug, dom, client) {


/**
* Save menu class namespace.
*/
var Saves = function() {};

/**
* Registers all gui event messages associated with 
* save game menu functionality. 
*/
Saves.prototype.listen = function(router) {
	router.listen("savedGamesListResponse", this.displaySavedGamesMenu);
	router.listen("toggleSavedGamesMenu", this.toggleSavedGamesMenu);
	router.listen("saveGameClick", this.saveGameClick);
	router.listen("loadGameClick", this.loadGameClick);
	router.listen("deleteGameClick", this.deleteGameClick);
}

/**
* If the saved games menu is currently hidden, a current saved games list 
* is requested from the server and displayed. If it is currently displayed,
* the list is hidden.
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
* Formats a given saved games list object into html and
* inserts into the current document html.
*
* @param data A list of currently saved games. Elements of
*             this list are of the form 
*                 {author:a,file_name:f,map_file_path:p}.
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
* Prompts the user for a file name and requests to save
* the current game (currently just the map, not an entire
* game object) under this file name on the server, with 
* the requesting user listed as its author.
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
* Prompts the user for a file name and attempts to load
* this file from the server.
*/
Saves.prototype.loadGameClick = function() {
    var filename = window.prompt("Load game:", "filename");
    if(filename) {
        client.emit("loadNewMap", {filename:filename, 
			username:client.username});
    }
}

/**
* Prompts the user for a file name and attempts to
* delete this file from the server.
*/
Saves.prototype.deleteGameClick = function() {
    var filename = window.prompt("Delete game:", "filename");
    if(filename) {
        client.emit("deleteSavedGame", filename);
    }
}

return new Saves();

});

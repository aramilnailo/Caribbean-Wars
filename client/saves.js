/**
* Save menu class namespace.
*
* @module client/Saves
*/
define(["debug", "dom", "client"], function(debug, dom, client) {


var Saves = function() {};

/**
* Registers all gui event messages associated with 
* save game menu functionality. 
*
* @memberof module:client/Saves
*/
Saves.prototype.listen = function(router) {
	router.listen("savedGamesListResponse", this.displaySavedGamesList);
	router.listen("savedGamesMenuToggle", this.toggleSavedGamesMenu);
	router.listen("saveGameClick", this.saveGameClick);
	router.listen("loadGameClick", this.loadGameClick);
	router.listen("deleteGameClick", this.deleteGameClick);
}

/**
* If the saved games menu is currently hidden, a current saved games list 
* is requested from the server and displayed. If it is currently displayed,
* the list is hidden.
*
* @memberof module:client/Saves
*/
Saves.prototype.toggleSavedGamesMenu = function() {
    if(dom.savedGamesMenu.style.display === "none") {
		client.emit("savedGamesListRequest", null);
		dom.savedGamesMenu.style.display = "block";
		dom.savedGamesMenuButton.innerHTML = "Hide saved games";
    } else {
		dom.savedGamesMenu.style.display = "none";
		dom.savedGamesMenuButton.innerHTML = "Show saved games";
    }
}

/**
* Formats a given saved games list object into html and
* inserts into the current document html.
*
* @param data A list of currently saved games. Elements of
*             this list are of the form 
*                 {author:a,file_name:f,map_file_path:p}.
* @memberof module:client/Saves
*/
Saves.prototype.displaySavedGamesList = function(data) {
// Format the saved_games table into HTML
    var i;
    var html = "<table>" +
	"<tr>" +
	"<th>Author</th>" +
	"<th>File Name</th>" +
	"</tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].author+"</td>" +
	    "<td>" + data[i].file_name + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    dom.savedGamesList.innerHTML = html;
}

/**
* Prompts the user for a file name and requests to save
* the current game (currently just the map, not an entire
* game object) under this file name on the server, with 
* the requesting user listed as its author.
*
* @memberof module:client/Saves
*/
Saves.prototype.saveGameClick = function() {
	if(!client.inGame) {
		alert("Cannot save outside of game");
		return;
	}
    var filename = window.prompt("Save as: ","filename");
    if(filename) {
        client.emit("saveGameState", filename);
    }
}

/**
* Prompts the user for a file name and attempts to load
* this file from the server.
*
* @memberof module:client/Saves
*/
Saves.prototype.loadGameClick = function() {
	if(!client.inGame) {
		alert("Cannot load outside of game");
		return;
	}
    var filename = window.prompt("Load game:", "filename");
    if(filename) {
        client.emit("loadGameState", filename);
    }
	client.loading = true;
}

/**
* Prompts the user for a file name and attempts to
* delete this file from the server.
*
* @memberof module:client/Saves
*/
Saves.prototype.deleteGameClick = function() {
    var filename = window.prompt("Delete game:", "filename");
    if(filename) {
        client.emit("deleteSavedGame", filename);
    }
}

return new Saves();

});

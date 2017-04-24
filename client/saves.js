/**
* Save menu class namespace.
*
* @module client/Saves
*/
define(["debug", "dom", "client", "alerts"], function(debug, dom, client, alerts) {


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
	router.listen("setLoadingFalse", this.setLoadingFalse);
}

/**
* If the saved games menu is currently hidden, a current saved games list 
* is requested from the server and displayed. If it is currently displayed,
* the list is hidden.
*
* @memberof module:client/Saves
*/
Saves.prototype.toggleSavedGamesMenu = function(data) {
    if(dom.savedGamesMenu.style.display === "none") {
		client.emit("savedGamesListRequest", null);
		dom.savedGamesMenu.style.display = "block";
		
		if(dom.savedMapsMenu.style.display !== "none") {
			dom.savedMapsMenu.style.display = "none";
		}
		if(dom.statsMenu.style.display !== "none") {
			dom.statsMenu.style.display = "none";
		}
		
		var rect = dom.mainMenu.getBoundingClientRect();
		var rect2 = dom.savedGamesMenu.getBoundingClientRect();
		dom.savedGamesMenu.style.left = (rect.left - rect2.width) + "px";
		dom.savedGamesMenu.style.top = rect.top + "px";
    } else {
		dom.savedGamesMenu.style.display = "none";
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
Saves.prototype.saveGameClick = function(data) {
	if(!client.inGame) {
		alerts.pushAlert("Cannot save outside of game");
		return;
	}
    alerts.showPrompt("Save as: ", function(resp) {
	    if(resp) client.emit("saveGameState", resp);
    });
}

/**
* Prompts the user for a file name and attempts to load
* this file from the server.
*
* @memberof module:client/Saves
*/
Saves.prototype.loadGameClick = function(data) {
	if(!client.inGame) {
		alerts.pushAlert("Cannot load outside of game");
		return;
	}
    alerts.showPrompt("Load game: ", function(resp) {
   		if(resp) client.emit("loadGameState", resp);
		client.loading = true;
    });
}

/**
* Prompts the user for a file name and attempts to
* delete this file from the server.
*
* @memberof module:client/Saves
*/
Saves.prototype.deleteGameClick = function(data) {
    alerts.showPrompt("Delete game:", function(resp) {
	    if(resp) client.emit("deleteSavedGame", resp);
	});
}

Saves.prototype.setLoadingFalse = function(data) {
	client.loading = false;
}

return new Saves();

});

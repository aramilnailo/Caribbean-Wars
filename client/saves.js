
var debug = require("./debug.js").saves;
var log = require("./debug.js").log;

var DOM = require("./dom.js");
var client = require("./client.js");

var Saves = function() {};

Saves.prototype.listen = function(router) {
	router.listen("savedGamesListResponse", displaySavedGamesMenu);
	router.listen("toggleSavedGamesMenu", toggleSavedGamesMenu);
	router.listen("saveGameClick", saveGameClick);
	router.listen("loadGameClick", loadGameClick);
	router.listen("deleteGameClick", deleteGameClick);
}

// Show and hide the saved game menu
Saves.prototype.toggleSavedGamesMenu = function() {
    if(DOM.savedGamesMenuHidden) {
		client.emit("savedGamesListRequest", null);
		DOM.savedGamesMenuButton.innerHTML = "Hide saved games";
		DOM.savedGamesMenuHidden = false;
    } else {
		DOM.savedGamesMenu.style.display = "none";
		DOM.savedGamesMenuButton.innerHTML = "Show saved games";
		DOM.savedGamesMenuHidden = true;
    }
}

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
    DOM.savedGamesList.innerHTML = html;
    // Make the saved games screen visible
    DOM.savedGamesMenu.style.display = "inline-block";
}

Saves.prototype.saveGameClick = function() {
    var filename = window.prompt("Save as: ","filename");
    if(filename) {
        client.emit("saveGameRequest",
            {file_name:filename, author:username,
             map_file_path:mapData.path});
    }
}

Saves.prototype.loadGameClick = function() {
    var filename = window.prompt("Load game:", "filename");
    if(filename) {
        client.emit("loadNewMap", {filename:filename, username:username});
    }
}

Saves.prototype.deleteGameClick = function() {
    var filename = window.prompt("Delete game:", "filename");
    if(filename) {
        client.emit("deleteSavedGame", filename);
    }
}

module.exports = new Saves();
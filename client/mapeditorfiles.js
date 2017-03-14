/**
* Map editor saved maps class namespace.
*
* @module client/MapEditorFiles
*/
define(["debug", "dom", "client"], function(debug, dom, client) {


var MapEditorFiles = function() {};

/**
* Registers all gui event messages associated with 
* save game menu functionality. 
*
* @memberof module:client/MapEditorFiles
*/
MapEditorFiles.prototype.listen = function(router) {
    if(debug.mapeditorsavedlist) debug.log("client/mapeditorlistmenu.js: listen()");
    router.listen("mapEditorSavedMapsListResponse", this.displaySavedMapsList);
    router.listen("toggleMapEditorFiles", this.toggleSavedMapsList);
    router.listen("mapEditorSaveMapClick", this.saveMapClick);
    router.listen("mapEditorLoadMapClick", this.loadMapClick);
    router.listen("deleteSavedMapClick", this.deleteMapClick);
}

/**
* If the saved maps menu is currently hidden, a current saved games map list
* is requested from the server and displayed. If it is currently displayed,
* the list is hidden.
*
* @memberof module:client/MapEditorFiles
*/
MapEditorFiles.prototype.toggleSavedMapsList = function() {
    if(dom.mapEditorMapsListHidden) {
		client.emit("mapEditorSavedMapsListRequest", null);
		dom.mapEditorSavedMapsListButton.innerHTML = "Hide saved maps";
		dom.mapEditorMapsListHidden = false;
    } else {
		dom.mapEditorSavedMapsList.style.display = "none";
		dom.mapEditorSavedMapsListButton.innerHTML = "Saved maps";
		dom.mapEditorMapsListHidden = true;
    }
}

/**
* Formats a given saved maps list object into html and
* inserts into the current document html.
*
* @param data A list of currently saved maps. Elements of
*             this list are of the form 
*                 {author:a,file_name:f}.
* @memberof module:client/MapEditorMapsList
*/
MapEditorFiles.prototype.displaySavedMapsList = function(data) {
// Format the saved_games table into HTML
    var i;
    var html = "<table>" +
	"<tr>" +
	"<th>Author</th>" +
	"<th>Map Name</th>" +
	"</tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].author+"</td>" +
	    "<td>" + data[i].file_name + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    dom.mapEditorSavedMapsList.innerHTML = html;
    dom.mapEditorSavedMapsList.style.display = "inline-block";
}

/**
* Prompts the user for a file name and requests to save
* the current game (currently just the map, not an entire
* game object) under this file name on the server, with 
* the requesting user listed as its author.
*
* @memberof module:client/MapEditorFiles
*/
MapEditorFiles.prototype.saveMapClick = function() {
    var filename = window.prompt("Save as: ","filename");
    if(filename) {
        client.emit("saveMapRequest",
            {file_name:filename, author:username});
    }
}

/**
* Prompts the user for a file name and attempts to load
* this file from the server.
*
* @memberof module:client/MapEditorFiles
*/
MapEditorFiles.prototype.loadMapClick = function() {
    var filename = window.prompt("Load map:", "filename");
    if(filename) {
        client.emit("getEditMap", {filename:filename, 
				   username:client.username,
				   usertype:client.usertype});
    }
}

/**
* Prompts the user for a file name and attempts to
* delete this file from the server.
*
* @memberof module:client/MapEditorFiles
*/
MapEditorFiles.prototype.deleteMapClick = function() {
    var filename = window.prompt("Delete map:", "filename");
    if(filename) {
        client.emit("deleteSavedMap", filename);
    }
}

return new MapEditorFiles();

});

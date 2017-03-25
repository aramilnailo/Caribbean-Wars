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
    router.listen("savedMapsListResponse", this.displaySavedMapsList);
    router.listen("toggleSavedMapsList", this.toggleSavedMapsList);
    router.listen("mapEditorSaveMapClick", this.saveMapClick);
    router.listen("mapEditorLoadMapClick", this.loadMapClick);
    router.listen("mapEditorDeleteMapClick", this.deleteMapClick);
}

MapEditorFiles.prototype.toggleSavedMapsList = function() {
    if(dom.mapEditorMapsListHidden) {
		client.emit("savedMapsListRequest", null);
		dom.mapEditorSavedMapsListButton.innerHTML = "Hide saved maps";
		dom.mapEditorMapsListHidden = false;
    } else {
		dom.mapEditorSavedMapsList.style.display = "none";
		dom.mapEditorSavedMapsListButton.innerHTML = "Saved maps";
		dom.mapEditorMapsListHidden = true;
    }
}

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

MapEditorFiles.prototype.saveMapClick = function() {
	var filename = window.prompt("Save as: ","filename");
	if(filename) {
	    client.emit("saveEditMap", {filename:filename, map:client.map});
	}
};

MapEditorFiles.prototype.loadMapClick= function() {
	var filename = window.prompt("Load file: ","filename");
	if (filename) {
		client.loading = true;
	    client.emit("loadEditMap", filename);
	}
};

MapEditorFiles.prototype.deleteMapClick = function() {
    var filename = window.prompt("Delete map:", "filename");
    if(filename) {
        client.emit("deleteMap", filename);
    }
};


return new MapEditorFiles();

});

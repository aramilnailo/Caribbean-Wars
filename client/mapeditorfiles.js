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
    router.listen("savedMapsMenuToggle", this.toggleSavedMapsMenu);
    router.listen("saveMapClick", this.saveMapClick);
    router.listen("loadMapClick", this.loadMapClick);
    router.listen("deleteMapClick", this.deleteMapClick);
};

MapEditorFiles.prototype.toggleSavedMapsMenu = function() {
    if(dom.savedMapsMenu.style.display === "none") {
		client.emit("savedMapsListRequest", null);
		dom.savedMapsMenu.style.display = "block";
		dom.savedMapsMenuButton.innerHTML = "Hide saved maps";
    } else {
		dom.savedMapsMenu.style.display = "none";
		dom.savedMapsMenuButton.innerHTML = "Show saved maps";
    }
};

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
    dom.savedMapsList.innerHTML = html;
};

MapEditorFiles.prototype.saveMapClick = function() {
	if(client.usertype !== "editor" && !client.inGame) {
		alert("Can only save in game or editor");
		return;
	}
	var filename = window.prompt("Save as: ","filename");
	if(filename) {
	    client.emit("saveEditMap", {filename:filename, map:client.map});
	}
};

MapEditorFiles.prototype.loadMapClick= function() {
	if(client.usertype !== "editor") {
		alert("Cannot load maps outside of editor");
		return;
	}
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

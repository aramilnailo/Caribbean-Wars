/**
* Map editor saved maps class namespace.
*
* @module client/MapEditorFiles
*/
define(["debug", "dom", "client", "alerts"], function(debug, dom, client, alerts) {


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

MapEditorFiles.prototype.toggleSavedMapsMenu = function(data) {
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

MapEditorFiles.prototype.saveMapClick = function(data) {
	if(client.usertype !== "editor" && !client.inGame) {
		alerts.pushAlert("Can only save in game or editor");
		return;
	}
	alerts.showPrompt("Save as: ", function(resp) {
		if(resp) {
			client.map.name = resp;
			client.map.author = client.username;
			client.emit("saveEditMap", {filename:resp, map:client.map});
		}
	});
};

MapEditorFiles.prototype.loadMapClick= function(data) {
	if(client.usertype !== "editor") {
		alerts.pushAlert("Cannot load maps outside of editor");
		return;
	}
	alerts.showPrompt("Load map: ", function(resp) {
		if(resp) {
	    	client.emit("loadEditMap", resp);
			client.loading = true;
		}
	});
};

MapEditorFiles.prototype.deleteMapClick = function(data) {
	alerts.showPrompt("deleteMap", function(resp) {
		if(resp) client.emit("deleteMap", resp);
	});
};


return new MapEditorFiles();

});

define(["debug", "dom", "client", "alerts"], function(debug, dom, client, alerts) {
	
var log = debug.log;

var Users = function() {}

Users.prototype.listen = function(router) {
	router.listen("userMenuToggle", this.toggleUserMenu);
	router.listen("userListResponse", this.displayUserList);
	router.listen("addUserClick", this.addUserClick);
	router.listen("deleteUserClick", this.deleteUserClick);
	router.listen("userTypeClick", this.userTypeClick);
}

// Show and hide the user menu
Users.prototype.toggleUserMenu = function() {
    if (debug.users) log("client/users.js:");
    if(dom.userMenu.style.display === "none") {
	    if (debug.users) log("toggleUserMenu(): Show users");
        client.emit("userListRequest", null);
		dom.userMenuButton.innerHTML = "Hide users";
		dom.userMenu.style.display = "block";
    } else {
        if (debug.users) log("toggleUserMenu(): Hide users");
        dom.userMenu.style.display = "none";	
		dom.userMenuButton.innerHTML = "Show users";
    }
}

// Display the table with username, password, 
// user type, and online status
Users.prototype.displayUserList = function(data) {
    if (debug.users) log("client/users.js: displayUserList()");
    var i;
    var html = "<table>" +
	"<tr>" +
	"<th>Username</th>" +
	"<th>Usertype</th>" +
	"<th>Password</th>" +
	"<th>Online</th>" +
	"<th>In Game</th>" +
	"</tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].username + "</td>" +
	    "<td>"+ data[i].usertype + "</td>" +
	    "<td>" + data[i].password + "</td>" +
	    "<td>" + data[i].online + "</td>" +
		"<td>" + data[i].in_game + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    dom.userList.innerHTML = html;
}

// Sign a new user up
Users.prototype.addUserClick = function(data) {
	if(debug.users) log("[Users] addUserClick");
	alerts.showPrompt("[Add user] Username?", function(uname) {
		if(uname) alerts.showPrompt("[Add user] Password?", function(pword) {
			if(pword) { 
				client.emit("signup", 
				{	
					username:uname, 
					password:pword, 
					usertype:"player"
				});
			}
		});
	});
		
}

// Remove a user
Users.prototype.deleteUserClick = function(data) {
	if(debug.users) log("[Users] deleteUserClick");
	alerts.showPrompt("[Delete user] Username?", function(uname) {
		if(uname) {
			if(uname === "admin") alerts.pushAlert("Cannot delete admin.");
		} else {
			client.emit("deleteAccount", uname);
		}
	});
}

// Change a user's type
Users.prototype.userTypeClick = function(data) {
	if(debug.users) log("[Users] userTypeClick");
	alerts.showPrompt("Username?", function(uname) {
		if(uname) alerts.showPrompt("New type?", function(type) {
			if(type === "admin" || type === "player" || type === "editor") {
				client.emit("changeUserType", {username:uname, type:type});
			} else {
				alerts.pushAlert("Invalid type.");
			}	
		});
	});
}

return new Users();

});
define(["debug", "dom", "client"], function(debug, dom, client) {
	
	var log = debug.log;
	
	var Users = function() {}
	
	Users.prototype.listen = function(router) {
		router.listen("toggleUserMenu", this.toggleUserMenu);
		router.listen("userListResponse", this.displayUserList);
		router.listen("addUserClick", this.addUserClick);
		router.listen("deleteUserClick", this.deleteUserClick);
		router.listen("userTypeClick", this.userTypeClick);
	}
	
	// Show and hide the user menu
	Users.prototype.toggleUserMenu = function() {
	    if (debug.users) log("client/users.js:");
	    if(dom.userMenuHidden) {
		    if (debug.users) log("toggleUserMenu(): Show users");
	        client.emit("userListRequest", {usertype:client.usertype});
			dom.userMenuButton.innerHTML = "Hide users";
			dom.userMenu.style.display = "inline-block";
			dom.userMenuHidden = false;
	    } else {
	        if (debug.users) log("toggleUserMenu(): Hide users");
	        dom.userMenu.style.display = "none";	
			dom.userMenuButton.innerHTML = "Show users";
			dom.userMenuHidden = true;
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
		"<th>Account type</th>" +
		"<th>Password</th>" +
		"<th>Online</th>" +
		"</tr>";
	    for(i = 0; i < data.length; i++) {	
		html += "<tr>" +
		    "<td>"+ data[i].username + "</td>" +
		    "<td>"+ data[i].usertype + "</td>" +
		    "<td>" + data[i].password + "</td>" +
		    "<td>" + data[i].online + "</td>" +
		    "</tr>";
	    }
	    html += "</table>";
	    dom.userList.innerHTML = html;
	}
	
	// Sign a new user up
	Users.prototype.addUserClick = function(data) {
		if(debug.users) log("[Users] addUserClick");
		var username, password;
		username = window.prompt("[Add user] Username?", "user");
		if(username) password = window.prompt("[Add user] Password?", "password");
		if(username && username.length > 0 && password && password.length > 0) {
			client.emit("signup", {username:username, password:password, usertype:"player"});
		} else {
			alert("Invalid input");
		}
	}
	
	// Remove a user
	Users.prototype.deleteUserClick = function(data) {
		if(debug.users) log("[Users] deleteUserClick");
		var username = window.prompt("[Delete user] Username?", "user");
		if(username) {
			if(username === "admin") {
				alert("Cannot delete admin");
			} else {
				client.emit("deleteAccount", username);
			}
		} else {
			alert("Invalid input");
		}
	}
	
	// Change a user's type
	Users.prototype.userTypeClick = function(data) {
		if(debug.users) log("[Users] userTypeClick");
		var username, type;
		username = window.prompt("Username?", "user");
		if(username) type = window.prompt("New type?", "type");
		if(type === "admin" || type === "player" || type === "editor") {
			client.emit("changeUserType", {username:username, type:type});
		} else {
			alert("Invalid input");
		}
	}
	
	return new Users();
});
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
		    if (debug.login) log("toggleUserMenu(): Show users");
	        client.emit("userListRequest", {usertype:client.usertype});
			dom.userMenuButton.innerHTML = "Hide users";
			dom.userMenu.style.display = "inline-block";
			dom.userMenuHidden = false;
	    } else {
	        if (debug.login) log("toggleUserMenu(): Hide users");
	        dom.userMenu.style.display = "none";	
			dom.userMenuButton.innerHTML = "Show users";
			dom.userMenuHidden = true;
	    }
	}

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
	
	Users.prototype.addUserClick = function(data) {
		if(debug.users) log("[Users] addUserClick");
		var username = window.prompt("[Add user] Username?", "user");
		var password = window.prompt("[Add user] Password?", "password");
		client.emit("signup", {username:username, password:password, usertype:"player"});
	}
	
	Users.prototype.deleteUserClick = function(data) {
		if(debug.users) log("[Users] deleteUserClick");
		var username = window.prompt("[Delete user] Username?", "user");
		if(username === "admin") {
			alert("Cannot delete admin");
		} else {
			client.emit("deleteAccount", username);
		}
	}
	
	Users.prototype.userTypeClick = function(data) {
		if(debug.users) log("[Users] userTypeClick");
	}
	
	return new Users();
});
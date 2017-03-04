define(["debug", "dom", "client"], function(debug, dom, client) {

var ViewLogin = function() {}

ViewLogin.prototype.listen = function(router) {
	router.listen("userListResponse", this.displayUserList);
	router.listen("toggleUserList", this.toggleUserList);
	router.listen("loginClick", this.loginClick);
	router.listen("signupClick", this.signupClick);
	router.listen("logoutClick", this.logoutClick);
	router.listen("deleteAccountClick", this.deleteAccountClick);
}

// Show and hide the user list
ViewLogin.prototype.toggleUserList = function() {
    if(dom.userListHidden) {
		client.emit("userListRequest", null);
		dom.userListButton.innerHTML = "Hide users";
		dom.userListHidden = false;
    } else {
		dom.userList.style.display = "none"	
		dom.userListButton.innerHTML = "List users";
		dom.userListHidden = true;
    }
}

ViewLogin.prototype.displayUserList = function(data) {
    var i;
    dom.userList.style.display = "table";
    var html = "<table>" +
	"<tr>" +
	"<th>Username</th>" +
	"<th>Password</th>" +
	"<th>Online</th>" +
	"</tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].username + "</td>" +
	    "<td>" + data[i].password + "</td>" +
	    "<td>" + data[i].online + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    dom.userList.innerHTML = html;
}

// ViewLogin button is clicked on login screen
ViewLogin.prototype.loginClick = function() {
    // Don't submit empty forms
    if(dom.loginUsername.value.length > 0 &&
       dom.loginPassword.value.length > 0)
	client.emit("login", {username:dom.loginUsername.value,
			  password:dom.loginPassword.value});
}

// Sign up button is clicked on login screen
ViewLogin.prototype.signupClick = function() {
    // Don't submit empty forms
    if(dom.loginUsername.value.length > 0 &&
       dom.loginPassword.value.length > 0)
	client.emit("signup", {username:dom.loginUsername.value,
			   password:dom.loginPassword.value});
}

// If logout button is clicked on game screen
ViewLogin.prototype.logoutClick = function() {
    client.emit("logout", null);
}

// Delete account button is clicked on game screen
ViewLogin.prototype.deleteAccountClick = function() {
    if(confirm("Are you sure you want to delete this account?")) {
	   client.emit("deleteAccount", null);
    }
}

return new ViewLogin();

});

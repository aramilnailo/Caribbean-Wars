
var debug = require("./debug.js").login;
var log = require("./debug.js").log;

var DOM = require("./dom.js");
var client = require("./client.js");

var Login = function() {}

Login.prototype.listen = function(router) {
	router.listen("userListResponse", displayUserList);
	router.listen("toggleUserList", toggleUserList);
	router.listen("loginClick", loginClick);
	router.listen("signupClick", signupClick);
	router.listen("logoutClick", logoutClick);
	router.listen("deleteAccountClick", deleteAccountClick);
}

// Show and hide the user list
Login.prototype.toggleUserList = function() {
    if(DOM.userListHidden) {
		client.emit("userListRequest", null);
		DOM.userListButton.innerHTML = "Hide users";
		DOM.userListHidden = false;
    } else {
		DOM.userList.style.display = "none"	
		DOM.userListButton.innerHTML = "List users";
		DOM.userListHidden = true;
    }
}

Login.prototype.displayUserList = function(data) {
    var i;
    DOM.userList.style.display = "table";
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
    DOM.userList.innerHTML = html;
}

// Login button is clicked on login screen
Login.prototype.loginClick = function() {
    // Don't submit empty forms
    if(DOM.loginUsername.value.length > 0 &&
       DOM.loginPassword.value.length > 0)
	client.emit("login", {username:DOM.loginUsername.value,
			  password:DOM.loginPassword.value});
}

// Sign up button is clicked on login screen
Login.prototype.signupClick = function() {
    // Don't submit empty forms
    if(DOM.loginUsername.value.length > 0 &&
       DOM.loginPassword.value.length > 0)
	client.emit("signup", {username:DOM.loginUsername.value,
			   password:DOM.loginPassword.value});
}

// If logout button is clicked on game screen
Login.prototype.logoutClick = function() {
    client.emit("logout", null);
}

// Delete account button is clicked on game screen
Login.prototype.deleteAccountClick = function() {
    if(confirm("Are you sure you want to delete this account?")) {
	   client.emit("deleteAccount", null);
    }
}

module.exports = new Login();
/**
 * @module viewlogin
 */


define(["debug", "dom", "client"], function(debug, dom, client) {

/**
* Login view namespace with functions related to clicking
* buttons associated with user account operations.
*/
var ViewLogin = function() {}


/**
* Registers all functions in the viewLogin namespace
* with the given message router.
* @param router - the message router
* @memberof module:viewlogin
**/
ViewLogin.prototype.listen = function(router) {
	router.listen("userListResponse", this.displayUserList);
	router.listen("toggleUserList", this.toggleUserList);
	router.listen("loginClick", this.loginClick);
	router.listen("signupClick", this.signupClick);
	router.listen("logoutClick", this.logoutClick);
	router.listen("deleteAccountClick", this.deleteAccountClick);
}

/**
* Shows and hides the userList HTML. Requests the
* user list from the server when toggled on.
* @memberof module:viewlogin
*/
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

/**
* Upon recieving the user list from the server, this
* function formats the data into an HTML table and
* appends it to the inner HTML of the userList.
* @param data - the user list in form of SQL rows
* @memberof module:viewlogin
*/
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

/**
* Emits the data from the username and password
* forms on the login screen. Checks that they are
* not empty before sumbitting.
* @memberof module:viewlogin
*/
ViewLogin.prototype.loginClick = function() {
    // Don't submit empty forms
    if(dom.loginUsername.value.length > 0 &&
       dom.loginPassword.value.length > 0)
	client.emit("login", {username:dom.loginUsername.value,
			  password:dom.loginPassword.value});
}

/**
* Emits the data from the username and password
* forms to sign up a new user. Checks that they are
* not empty before submitting.
* @memberof module:viewlogin
*/
ViewLogin.prototype.signupClick = function() {
    // Don't submit empty forms
    if(dom.loginUsername.value.length > 0 &&
       dom.loginPassword.value.length > 0)
	client.emit("signup", {username:dom.loginUsername.value,
			   password:dom.loginPassword.value});
}

/**
* Emits the logout signal.
* @memberof module:viewlogin
*/
ViewLogin.prototype.logoutClick = function() {
    client.emit("logout", null);
}

/**
* After confirming with the user, emits the delete account signal.
* @memberof module:viewlogin
*/
ViewLogin.prototype.deleteAccountClick = function() {
    if(confirm("Are you sure you want to delete this account?")) {
	   client.emit("deleteAccount", null);
    }
}

return new ViewLogin();

});

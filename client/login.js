define(["debug", "dom", "client"], function(debug, dom, client) {

var log = debug.log;
    
var Login = function() {}
    
Login.prototype.listen = function(router) {
    if (debug.login) log("client/login.js: listen()");
    router.listen("userListResponse", this.displayUserList);
    router.listen("toggleUserList", this.toggleUserList);
    router.listen("loginClick", this.loginClick);
    router.listen("signupClick", this.signupClick);
    router.listen("logoutClick", this.logoutClick);
    router.listen("mapEditorLogoutClick", this.mapEditorLogoutClick);
    router.listen("deleteAccountClick", this.deleteAccountClick);
}

// Show and hide the user list
Login.prototype.toggleUserList = function() {
    if (debug.login) log("client/login.js:");
    if(dom.userListHidden) {
	        if (debug.login) log("toggleUserList(): List users");
         	client.emit("userListRequest", {usertype:dom.loginUsertype.value});
		dom.userListButton.innerHTML = "Hide users";
		dom.userListHidden = false;
    } else {
                if (debug.login) log("toggleUserList(): Hide users");
         	dom.userList.style.display = "none";	
		dom.userListButton.innerHTML = "List users";
		dom.userListHidden = true;
    }
}

Login.prototype.displayUserList = function(data) {
    if (debug.login) log("client/login.js: displayUserList()");
    var i;
    dom.userList.style.display = "table";
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

// Login button is clicked on login screen
Login.prototype.loginClick = function() {
    if (debug.login) log("client/login.js: loginClick()");
    var radios = dom.loginUsertypeForm;
    for (var i = 0; i < radios.length; i++) {
	if (debug) log("loginClick() : radios[i].checked,value = "+radios[i].checked+","+radios[i].value);
	if (radios[i].type === "radio" && radios[i].checked) {
	    dom.loginUsertype.value = radios[i].value;
	}
    }
    if (debug) log("client/login.js: loginClick(); usertype = "+dom.loginUsertype.value);
    // Don't submit empty forms
    if(dom.loginUsername.value.length > 0 &&
       dom.loginUsertype.value &&
       dom.loginPassword.value.length > 0)
	client.emit("login", {username:dom.loginUsername.value,
			      usertype:dom.loginUsertype.value,
			      password:dom.loginPassword.value});
}

// Sign up button is clicked on login screen
Login.prototype.signupClick = function() {
    // Don't submit empty forms
    var radios = dom.loginUsertypeForm;
    if (debug.login) log("client/login.js: signupClick()");
    for (var i = 0; i < radios.length; i++) {
	if (debug.login) log("signupClick() : radios[i].checked,value = "+radios[i].checked+","+radios[i].value);
	if (radios[i].type === "radio" && radios[i].checked) {
	    dom.loginUsertype.value = radios[i].value;
	}
    }

    if(dom.loginUsername.value.length > 0 &&
       dom.loginUsertype.value &&
       dom.loginPassword.value.length > 0)
	client.emit("signup", {username:dom.loginUsername.value,
			       usertype:dom.loginUsertype.value,
			       password:dom.loginPassword.value});
}

// If logout button is clicked on game screen
Login.prototype.logoutClick = function() {
    if (debug.login) log("client/login.js: logoutClick()");
    client.emit("logout", null);
}

// If logout button is clicked on game screen
Login.prototype.mapEditorLogoutClick = function() {
    if (debug.login) log("client/login.js: mapEditorLogoutClick()");
    client.emit("mapEditorLogout", null);
}

// Delete account button is clicked on game screen
Login.prototype.deleteAccountClick = function() {
    if (debug.login) log("client/login.js:deleteAccountClick()");
    if(confirm("Are you sure you want to delete this account?")) {
	   client.emit("deleteAccount", null);
    }
}

return new Login();

});

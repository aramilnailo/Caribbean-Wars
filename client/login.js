define(["debug", "dom", "client", "alerts"], function(debug, dom, client, alerts) {

var log = debug.log;
    
var Login = function() {}
    
Login.prototype.listen = function(router) {
    if (debug.login) log("client/login.js: listen()");
    router.listen("loginClick", this.loginClick);
    router.listen("signupClick", this.signupClick);
    router.listen("logoutClick", this.logoutClick);
    router.listen("mapEditorLogoutClick", this.mapEditorLogoutClick);
    router.listen("deleteAccountClick", this.deleteAccountClick);
	router.listen("stopGameClick", this.stopGameClick);
	router.listen("leaveGameClick", this.leaveGameClick);
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
	client.emit("exitGameSession", null);
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
	if(client.username === "admin") {
		alerts.pushAlert("Cannot delete admin");
	} else if(confirm("Are you sure you want to delete this account?")) {
		client.emit("exitGameSession", client.username);
	    client.emit("deleteAccount", client.username);
    }
}

	// These don't really belong here...

Login.prototype.stopGameClick = function() {
	if(debug.login) log("[Login] stopGameClick");
	if(!client.inGame) {
		alerts.pushAlert("Game is not in progress");
		return;
	}
	client.emit("stopGame", null);
}

Login.prototype.leaveGameClick = function() {
	if(debug.login) log("[Login] leaveGameClick");
	if(!client.inGame) {
		alerts.pushAlert("Game is not in progress");
		return;
	}
	client.emit("exitGame", null);
}




return new Login();

});

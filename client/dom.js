
var router = "./router.js";

var DOM = {

	// Login page
	loginScreen:document.getElementById("login-screen"),
	loginUsername:document.getElementById("login-username"),
	loginPassword:document.getElementById("login-password"),
	loginButton:document.getElementById("login-btn"),
	signupButton:document.getElementById("signup-btn"),

	// User list
	userListButton:document.getElementById("user-list-btn"),
	userList:document.getElementById("user-list"),

	// Game screen
	gameScreen:document.getElementById("game-screen"),
	canvas:document.getElementById("canvas").getContext("2d"),

	// Upper game menu
	usernameLabel:document.getElementById("username-label"),
	logoutButton:document.getElementById("logout-btn"),
	deleteAccountButton:document.getElementById("delete-account-btn"),

	// Save game menu
	savedGamesMenuButton:document.getElementById("saved-games-menu-btn"),
	loadGameButton:document.getElementById("load-game-btn"),
	saveGameButton:document.getElementById("save-game-btn"),
	deleteGameButton:document.getElementById("delete-game-btn"),
	savedGamesMenu:document.getElementById("saved-games-menu"),
	savedGamesList:document.getElementById("saved-games-list"),

	// Stats menu
	statsMenu:document.getElementById("stats-menu"),
	statsMenuButton:document.getElementById("stats-menu-btn"),

	// Chat window
	chatWindow:document.getElementById("chat-window"),
	chatLog:document.getElementById("chat-log"),
	chatForm:document.getElementById("chat-form"),
	chatInput:document.getElementById("chat-input"),
	chatSubmitButton:document.getElementById("chat-submit-btn"),
	chatToggleButton:document.getElementById("chat-toggle-btn"),
	
	// UI flags
	userListHidden:true,
	chatWindowHidden:true,
	statsMenuHidden:true,
	savedGamesMenuHidden:true

}

DOM.document.onkeydown = function(event) { router.route({"keyPressed", event}); }
DOM.document.onkeyup = function(event) { router.route({"keyReleased", event}); }

DOM.chatForm.onsubmit = function(event) { router.route({"chatFormSubmit", event}); }
DOM.chatToggleButton.onclick = function() { router.route({"toggleChatWindow", null}); }

DOM.statsMenuButton.onclick = function() { router.route({"toggleStatsMenu", null}); }

DOM.userListButton.onclick = function() { router.route({"toggleUserList", null}); }
DOM.loginButton.onclick = function() { router.route({"loginClick", null}); }
DOM.signupButton.onclick = function() { router.route({"signupClick", null}); }
DOM.logoutButton.onclick = function() { router.route({"logoutClick", null}); }
DOM.deleteAccountButton.onclick = function() { router.route({"deleteAccountClick", null}); }

DOM.savedGamesMenuButton.onclick = function() { router.route({"toggleSavedGamesMenu", null}); }
DOM.saveGameButton.onclick = function() { router.route({"saveGameClick", null}); }
DOM.loadGameButton.onclick = function() { router.route({"loadGameClick", null}); }
DOM.deleteGameButton.onclick = function() { router.route({"deleteGameClick", null}); }

module.exports = DOM;
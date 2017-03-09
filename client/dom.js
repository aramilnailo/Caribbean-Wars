define(["router"], function(router) {

var dom = {
	// Document
	document:document,

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
	clearStatsButton:document.getElementById("clear-stats-btn"),

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

dom.document.onkeydown = function(event) { router.route({name:"keyPressed", data:event}); }
dom.document.onkeyup = function(event) { router.route({name:"keyReleased", data:event}); }

dom.chatForm.onsubmit = function(event) { router.route({name:"chatFormSubmit", data:event}); }
dom.chatToggleButton.onclick = function() { router.route({name:"toggleChatWindow", data:null}); }

dom.statsMenuButton.onclick = function() { router.route({name:"toggleStatsMenu", data:null}); }

dom.userListButton.onclick = function() { router.route({name:"toggleUserList", data:null}); }
dom.loginButton.onclick = function() { router.route({name:"loginClick", data:null}); }
dom.signupButton.onclick = function() { router.route({name:"signupClick", data:null}); }
dom.logoutButton.onclick = function() { router.route({name:"logoutClick", data:null}); }
dom.deleteAccountButton.onclick = function() { router.route({name:"deleteAccountClick", data:null}); }

dom.savedGamesMenuButton.onclick = function() { router.route({name:"toggleSavedGamesMenu", data:null}); }
dom.saveGameButton.onclick = function() { router.route({name:"saveGameClick", data:null}); }
dom.loadGameButton.onclick = function() { router.route({name:"loadGameClick", data:null}); }
dom.deleteGameButton.onclick = function() { router.route({name:"deleteGameClick", data:null}); }

dom.clearStatsButton.onclick = function() { router.route({name:"clearStatsClick", data:null}); }

dom.canvas.font = "30px Arial";

return dom;

});
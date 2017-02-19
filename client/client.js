
/*================ CONTENTS =============================================
  1) HTML Elements
  2) Login Screen UI Logic
  3) Login Screen Events
  4) Login Screen Socket Listeners
  5) Game Screen Events
  6) Game Screen Socket Listeners
  7) Chat logic
  8) To do																*/

//=============== 1) MODULES ===============================================

// Server connection
var socket = io();
  
//============== 2) HTML ELEMENTS ============================================

// Login screen
var loginScreen = document.getElementById("login-screen");
var loginUsername = document.getElementById("login-username");
var loginPassword = document.getElementById("login-password");
var loginButton = document.getElementById("login-btn");
var signupButton = document.getElementById("signup-btn");
var userListButton = document.getElementById("user-list-btn");
var userList = document.getElementById("user-list");

// Game screen
var gameScreen = document.getElementById("game-screen");
var canvas = document.getElementById("canvas").getContext("2d");
canvas.font = "30px Arial";
var usernameLabel = document.getElementById("username-label");
var logoutButton = document.getElementById("logout-btn");

var saveGameButton = document.getElementById("save-game-btn");
var savedGamesListButton = document.getElementById("saved-games-list-btn");
var savedGamesList = document.getElementById("saved-games-list");

var deleteAccountButton = document.getElementById("delete-account-btn");

// Chat window
var chatWindow = document.getElementById("chat-window");
var chatLog = document.getElementById("chat-log");
var chatInput = document.getElementById("chat-input");
var chatSubmitButton = document.getElementById("chat-submit-btn");
var chatToggleButton = document.getElementById("chat-toggle-btn");

//===================== 3) UI LOGIC ==================================

var userListHidden = true;
var chatWindowHidden = true;

// Show and hide the user list
var toggleUserList = function() {
    if(userListHidden) {
	socket.emit("userListRequest");
	userListButton.innerHTML = "Hide users";
	userListHidden = false;
    } else {
	userList.style.display = "none"	
	userListButton.innerHTML = "List users";
	userListHidden = true;
    }
}

// Show and hide the chat window
var toggleChatWindow = function() {
	if(chatWindowHidden) {
		chatWindow.style.display = "inline-block";
		chatToggleButton.innerHTML = "Hide chat";
		chatWindowHidden = false;
    } else {
		chatWindow.style.display = "none";
		chatToggleButton.innerHTML = "Show chat";
		chatWindowHidden = true;
    }
}

socket.on("collapseMenus", function() {
	if(!userListHidden) toggleUserList();
	if(!chatWindowHidden) toggleChatWindow();
	if(!savedGamesListHidden) toggleSavedGamesList();
});

//================ 3) LOGIN SCREEN EVENTS ==============================

// Login button is clicked on login screen
loginButton.onclick = function() {
    // Don't submit empty forms
    if(loginUsername.value.length > 0 &&
       loginPassword.value.length > 0)
	socket.emit("login", {username:loginUsername.value,
			  password:loginPassword.value});
}

// Sign up button is clicked on login screen
signupButton.onclick = function() {
    // Don't submit empty forms
    if(loginUsername.value.length > 0 &&
       loginPassword.value.length > 0)
	socket.emit("signup", {username:loginUsername.value,
			   password:loginPassword.value});
}

// List users button is clicked on login screen
userListButton.onclick = function() {
    toggleUserList();
}

//================= 4) LOGIN SCREEN SOCKET LISTENERS =======================

// On successful login or signup, transition to game screen
socket.on("loginResponse", function(data) {
    if(data.success === true) {
	loginScreen.style.display = "none";
	gameScreen.style.display = "inline-block";
	usernameLabel.innerHTML = data.username;
    }
});

// Display the user list, formatting the row data into HTML table
socket.on("userListResponse", function(data) {
    var i;
    userList.style.display = "table";
    var html = "<table><tr>" +
	"<th>Username</th>" +
	"<th>Password</th>" +
	"<th>Online</th></tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].username + "</td>" +
	    "<td>" + data[i].password + "</td>" +
	    "<td>" + data[i].online + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    userList.innerHTML = html;
});

//================ 5) GAME SCREEN EVENTS =====================================

// If logout button is clicked on game screen
logoutButton.onclick = function() {
    socket.emit("logout");
}

// Delete account button is clicked on game screen
deleteAccountButton.onclick = function() {
	socket.emit("deleteAccount");
}

// If input is pressed, emit object with the key and the new state
document.onkeydown = function(event) {
	// If the chat bar is not in focus
	if(chatInput !== document.activeElement) {
		if(event.keyCode === 68)
		socket.emit("keyPress", { inputId:"right", state:true});	
		else if(event.keyCode === 83)
		socket.emit("keyPress", { inputId:"down", state:true});
		else if(event.keyCode === 65)
		socket.emit("keyPress", { inputId:"left", state:true});
		else if(event.keyCode === 87)
		socket.emit("keyPress", { inputId:"up", state:true});
	}
}

// If input is released, emit object with the key and the new state
document.onkeyup = function(event) {
	if(chatInput !== document.activeElement) {
		if(event.keyCode === 68)
		socket.emit("keyPress", { inputId:"right", state:false});	
		else if(event.keyCode === 83)
		socket.emit("keyPress", { inputId:"down", state:false});
		else if(event.keyCode === 65)
		socket.emit("keyPress", { inputId:"left", state:false});
		else if(event.keyCode === 87)
		socket.emit("keyPress", { inputId:"up", state:false});
	}
}

// Show and hide the chat window
chatToggleButton.onclick = function() {
	toggleChatWindow();
}

//============= 6) GAME SCREEN SOCKET LISTENERS ===========================

// On successful logout, return to the login screen
socket.on("logoutResponse", function() {
    loginScreen.style.display = "inline-block";
    gameScreen.style.display = "none";
});

// Main rendering function--redraws canvas after recieving world state
socket.on("newPositions", function(data) {
    canvas.clearRect(0, 0, 500, 500);
    for(var i = 0; i < data.length; i++) {
	canvas.fillText(data[i].number, data[i].x, data[i].y);
    }
});

//=============== 7) CHAT LOGIC ===========================================

// Either queue submission for display or evaluate the expression
chatSubmitButton.onclick = function() {
	if(chatInput.value[0] === "/") {
		socket.emit("evalExpression", chatInput.value.slice(1));
	} else {
		socket.emit("chatPost", chatInput.value);
	}
	chatInput.value = "";
}

// Display the formatted chat post recieved from the server
socket.on("addToChat", function(data) {
    chatLog.innerHTML += "<div>" + data + "<\div>";
});

// Log the eval answer recieved from the server to the console
socket.on("evalAnswer", function(data) {
    console.log(data);
});

//================== 8) TO DO ==========================================


saveGameButton.onclick = function() {
    var filename = window.prompt("Save as: ","filename");
    socket.emit("saveGameRequest",filename);
}

socket.on("saveGameResponse", function(resp) {
    if (resp.value == true) {
	window.alert("Saved "+resp.filename);
    } else {
	window.alert("File not saved");
    }
})

savedGamesListButton.onclick = function() {
    toggleSavedGamesList();
}

/*
socket.on("saveGameResponse", function(data) {
	
});
*/

socket.on("savedGamesListResponse", function(data) {
    var i;
    savedGamesList.style.display = "table";
    var html = "<style> table#sgtable, th, td { border : 1px solid black; } </style>";
    html += "<table id=\"sgtable\">" +
	"<tr><th>Saved game</th></tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].file_name + "</td></tr>";
    }
    html += "</table>";

    savedGamesList.innerHTML = html;
});

var savedGamesListHidden = true;

var toggleSavedGamesList = function() {
    if(savedGamesListHidden) {
	socket.emit("savedGamesListRequest");
	savedGamesListButton.innerHTML = "Hide saved games";
	savedGamesListHidden = false;
    } else {
	savedGamesList.style.display = "none";
	savedGamesListButton.innerHTML = "Show saved games";
	savedGamesListHidden = true;
    }
}

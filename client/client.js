
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

var loadGameButton = document.getElementById("load-game-btn");
var saveGameButton = document.getElementById("save-game-btn");
var deleteGameButton = document.getElementById("delete-game-btn");
var savedGamesMenuButton = document.getElementById("saved-games-menu-btn");
var savedGamesMenu = document.getElementById("saved-games-menu");
var savedGamesList = document.getElementById("saved-games-list");

var deleteAccountButton = document.getElementById("delete-account-btn");

// Chat window
var chatWindow = document.getElementById("chat-window");
var chatLog = document.getElementById("chat-log");
var chatForm = document.getElementById("chat-form");
var chatInput = document.getElementById("chat-input");
var chatSubmitButton = document.getElementById("chat-submit-btn");
var chatToggleButton = document.getElementById("chat-toggle-btn");

//===================== 3) UI LOGIC ==================================

var userListHidden = true;
var chatWindowHidden = true;

var username = "";
var mapData = {data:"", path:""};

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
	if(!savedGamesMenuHidden) toggleSavedGamesMenu();
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
	username = data.username;
	// Request the map data for f1
	socket.emit("getMapDataFromPath", "./assets/map");
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
    // Clear screen
    canvas.clearRect(0, 0, 500, 500);
    // Draw the map
    drawMap();
    // Draw the players in black
    canvas.fillStyle = "#000000";
    for(var i = 0; i < data.length; i++) {
	canvas.fillText(data[i].number, data[i].x, data[i].y);
    }
});

// Recieve the map data after request
socket.on("mapData", function(data) {
    mapData = data;
});

socket.on("mapDataFailed", function() {
    alert("Could not open map file.");
});

//=============== RENDERING =============================================

var drawMap = function() {
    var i, j;
    for(i = 0; i < 10; i++) {
	for(j = 0; j < 10; j++) {
	    // 0 = blue, 1 = tan, 2 = green
	    var ch = mapData.data[11 * i + j]; // Current cell
	    canvas.fillStyle = (ch == "0") ? "#42C5F4" :
		(ch == "1") ? "#C19E70" : "#2A8C23";
	    canvas.fillRect(j * 50, i * 50, 50, 50);
	}
    }
}

//=============== 7) CHAT LOGIC ===========================================

// Send chat input to be displayed or evaluated
chatForm.onsubmit = function(e) {
    e.preventDefault();
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
    socket.emit("saveGameRequest",
		{file_name:filename,
		 user_name:username,
		 map_file_path:mapData.path});
}

socket.on("saveGameResponse", function(resp) {
    if (resp.value == true) {
	window.alert("Saved " + resp.filename);
    } else {
	window.alert("File not saved");
    }
})

savedGamesMenuButton.onclick = function() {
    toggleSavedGamesMenu();
}

socket.on("savedGamesListResponse", function(data) {
    // Format the saved_games table into HTML
    var i;
    var html = "<style> table#sgtable, th, td" +
	"{ border : 1px solid black; } </style>";
    html += "<table id=\"sgtable\">" +
	"<tr><th>Host</th><th>File Name</th><th>Map</th></tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].user_name+"</td>" +
	    "<td>" + data[i].file_name + "</td>" +
	    "<td>" + data[i].map_file_path + "</td></tr>";
    }
    html += "</table>";
    savedGamesList.innerHTML = html;
    // Make the saved games screen visible
    savedGamesMenu.style.display = "inline-block";
});

var savedGamesMenuHidden = true;

var toggleSavedGamesMenu = function() {
    if(savedGamesMenuHidden) {
	socket.emit("savedGamesListRequest");
	savedGamesMenuButton.innerHTML = "Hide saved games";
	savedGamesMenuHidden = false;
    } else {
	savedGamesMenu.style.display = "none";
	savedGamesMenuButton.innerHTML = "Show saved games";
	savedGamesMenuHidden = true;
    }
}

loadGameButton.onclick = function() {
    var filename = window.prompt("Load game:", "filename");
    socket.emit("getMapDataFromFilename", filename);
}

deleteGameButton.onclick = function() {
    var filename = window.prompt("Delete game:", "filename");
    socket.emit("deleteSavedGame", filename);
}

socket.on("deleteSavedGameResponse", function(data) {
    console.log(data);
    if(data) {
	alert("File deleted");
    } else {
	alert("File not deleted");
    }
});

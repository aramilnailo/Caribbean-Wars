
/*================ CONTENTS =============================================
  1) HTML Elements
  2) Login Screen UI Logic
  3) Login Screen Events
  4) Login Screen Socket Listeners
  5) Game Screen Events
  6) Game Screen Socket Listeners
  7) Chat logic
  8) To do							*/

//=============== MODULES ===============================================

// Server connection
var socket = io();

//============== HTML ELEMENTS ============================================

// Login page
var loginScreen = document.getElementById("login-screen");
var loginUsername = document.getElementById("login-username");
var loginPassword = document.getElementById("login-password");
var loginButton = document.getElementById("login-btn");
var signupButton = document.getElementById("signup-btn");

// User list
var userListButton = document.getElementById("user-list-btn");
var userList = document.getElementById("user-list");

// Game screen
var gameScreen = document.getElementById("game-screen");
var canvas = document.getElementById("canvas").getContext("2d");
canvas.font = "30px Arial";

// Upper game menu
var usernameLabel = document.getElementById("username-label");
var logoutButton = document.getElementById("logout-btn");
var deleteAccountButton = document.getElementById("delete-account-btn");

// Save game menu
var savedGamesMenuButton = document.getElementById("saved-games-menu-btn");
var loadGameButton = document.getElementById("load-game-btn");
var saveGameButton = document.getElementById("save-game-btn");
var deleteGameButton = document.getElementById("delete-game-btn");
var savedGamesMenu = document.getElementById("saved-games-menu");
var savedGamesList = document.getElementById("saved-games-list");

// Stats menu
var statsMenu = document.getElementById("stats-menu");
var statsMenuButton = document.getElementById("stats-menu-btn");

// Chat window
var chatWindow = document.getElementById("chat-window");
var chatLog = document.getElementById("chat-log");
var chatForm = document.getElementById("chat-form");
var chatInput = document.getElementById("chat-input");
var chatSubmitButton = document.getElementById("chat-submit-btn");
var chatToggleButton = document.getElementById("chat-toggle-btn");

//===================== MENU UI FLAGS  ==================================

var userListHidden = true;
var chatWindowHidden = true;
var statsMenuHidden = true;
var savedGamesMenuHidden = true;

//===================== CLIENT STATE VARIABLES ======================

var username = "";
var mapData = {data:"", path:""};

//===================== MENU UI FUNCTIONS ===========================

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

// Show and hide the stats menu
var toggleStatsMenu = function() {
    if(statsMenuHidden) {
	socket.emit("statsMenuRequest");
	statsMenu.style.display = "inline-block";
	statsMenuButton.innerHTML = "Hide stats";
	statsMenuHidden = false;
    } else {
	statsMenu.style.display = "none";
	statsMenuButton.innerHTML = "Show stats";
	statsMenuHidden = true;
    }
}

// Show and hide the saved game menu
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

// Display the user list, formatting the row data into HTML table
socket.on("userListResponse", function(data) {
    displayUserList(data);
});

var displayUserList = function(data) {
    var i;
    userList.style.display = "table";
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
    userList.innerHTML = html;
}

// Expand the stats menu after recieving the table data
socket.on("statsMenuResponse", function(data) {
    displayStatsMenu(data);
});
var displayStatsMenu = function(data) {
    var i;
    statsMenu.style.display = "table";
    var html = "<table>" +
	"<tr>" +
	"<th>Username</th>" +
	"<th>Seconds Played</th>" +
	"<th>Shots Fired</th>" +
	"<th>Distance Sailed</th>" +	
	"<th>Ships Sunk</th>" +
	"<th>Ships Lost</th>" +
	"</tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].username + "</td>" +
	    "<td>" + data[i].seconds_played + "</td>" +
	    "<td>" + data[i].shots_fired + "</td>" +
	    "<td>" + data[i].distance_sailed + "</td>" +
	    "<td>" + data[i].ships_sunk + "</td>" +
	    "<td>" + data[i].ships_lost + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    statsMenu.innerHTML = html;
}

socket.on("savedGamesListResponse", function(data) {
    displaySavedGamesMenu(data);
});
var displaySavedGamesMenu = function(data) {
// Format the saved_games table into HTML
    var i;
    var html = "<table>" +
	"<tr>" +
	"<th>Host</th>" +
	"<th>File Name</th>" +
	"<th>Map</th>" +
	"</tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].author+"</td>" +
	    "<td>" + data[i].file_name + "</td>" +
	    "<td>" + data[i].map_file_path + "</td>" +
	    "</tr>";
    }
    html += "</table>";
    savedGamesList.innerHTML = html;
    // Make the saved games screen visible
    savedGamesMenu.style.display = "inline-block";
}

// Hide all menus during a screen transition
socket.on("collapseMenus", function() {
    hideAllMenus();
});
var hideAllMenus = function() {
    if(!userListHidden) toggleUserList();
    if(!chatWindowHidden) toggleChatWindow();
    if(!savedGamesMenuHidden) toggleSavedGamesMenu();
}

//================= STATE TRANSITION LISTENERS ========================

// On successful login or signup, transition to game screen
socket.on("loginResponse", function(data) {
    loginToGameScreen(data);
});
var loginToGameScreen = function(data) {
    if(data.success === true) {
	loginScreen.style.display = "none";
	gameScreen.style.display = "inline-block";
	usernameLabel.innerHTML = data.username;
	username = data.username;
	// Request the map data
	socket.emit("getMap");
    }
}

// On successful logout, return to the login screen
socket.on("logoutResponse", function() {
    gameScreenToLogin();
});
var gameScreenToLogin = function() {
    loginScreen.style.display = "inline-block";
    gameScreen.style.display = "none";
}

//================ ONCLICK UI EVENTS ==============================


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

// If logout button is clicked on game screen
logoutButton.onclick = function() {
    socket.emit("logout");
}

// Delete account button is clicked on game screen
deleteAccountButton.onclick = function() {
    if(confirm("Are you sure you want to delete this account?")) {
	socket.emit("deleteAccount");
    }
}

saveGameButton.onclick = function() {
    var filename = window.prompt("Save as: ","filename");
    socket.emit("saveGameRequest",
		{file_name:filename, author:username,
		 map_file_path:mapData.path});
}

loadGameButton.onclick = function() {
    socket.emit("isHost", function(resp) {
	if(resp) {
	    var filename = window.prompt("Load game:", "filename");
	    socket.emit("loadNewMap", filename);
	} else {
	    alert("Only host may load saved games.");
	}
    });
}

deleteGameButton.onclick = function() {
    var filename = window.prompt("Delete game:", "filename");
    socket.emit("deleteSavedGame", filename);
}

// Show users button is clicked
userListButton.onclick = function() {
    toggleUserList();
}

// Show stats button is clicked
statsMenuButton.onclick = function() {
    toggleStatsMenu();
}

// Chat window button is clicked
chatToggleButton.onclick = function() {
    toggleChatWindow();
}

// Saved games menu button is clicked
savedGamesMenuButton.onclick = function() {
    toggleSavedGamesMenu();
}

//================= GAME INPUT ====================================

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

//================== GAME DATA LISTENERS ===========================

// Recieve the map data after request
socket.on("mapData", function(data) {
    setMap(data);
});

var setMap = function(data) {
    if(data) {
	mapData = data;
    } else {
	alert("Could not open map file.");
    }
}

//=============== RENDERING =============================================

// Main rendering function--redraws canvas after recieving world state
socket.on("newPositions", function(data) {
    renderGame(data);
});
var renderGame = function(data) {
    // Clear screen
    canvas.clearRect(0, 0, 500, 500);
    // Draw the map
    drawMap();
    // Draw the players in black
    canvas.fillStyle = "#000000";
    for(var i = 0; i < data.length; i++) {
	canvas.fillText(data[i].number, data[i].x, data[i].y);
    }
}

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

//=============== CHAT LOGIC ===========================================

// Send chat input to be displayed or evaluated
chatForm.onsubmit = function(e) {
    e.preventDefault();
    var input = chatInput.value;
    if(input[0] === "/") {
	socket.emit("evalExpression", input.slice(1));
    } else if(input[0] === "@") {
	// Extract the username from the string
	var user = input.split(" ")[0].slice(1);
	// Extract the message from the string
	var message = input.slice(user.length + 2); // @ + username + space
	socket.emit("privateMessage", {user:user, message:message});
    } else {
	socket.emit("chatPost", chatInput.value);
    }
    chatInput.value = "";
}

// Display the formatted chat post recieved from the server
socket.on("addToChat", function(data) {
    logToChat(data);
});
var logToChat = function(data) {
    chatLog.innerHTML += "<div>" + data + "<\div>";
}

socket.on("evalResponse", function(data) {
    logToConsole(data);
});
var logToConsole = function(data) {
    console.log(data);
}

//================== ALERTS =======================================

socket.on("saveGameResponse", function(data) {
    pushSaveAlert(data);
});
var pushSaveAlert = function(data) {
    if (data) {
	alert("Saved file");
    } else {
	alert("File not saved");
    }
}

socket.on("deleteSavedGameResponse", function(data) {
    pushDeleteAlert(data);
});
var pushDeleteAlert = function(data) {
    if(data) {
	alert("File deleted");
    } else {
	alert("File not deleted");
    }
}

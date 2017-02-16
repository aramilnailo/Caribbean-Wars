
/*================ CONTENTS =============================================
  1) HTML Elements
  2) Login Screen UI Logic
  3) Login Screen Events
  4) Login Screen Socket Listeners
  5) Game Screen Events
  6) Game Screen Socket Listeners
  7) Chat logic
  8) To do																*/

//============== 1) HTML ELEMENTS ============================================

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
var chatText = document.getElementById("chat-text");
var chatInput = document.getElementById("chat-input");
var chatForm = document.getElementById("chat-form");
var usernameLabel = document.getElementById("username-label");
var logoutButton = document.getElementById("logout-btn");

//============== 2) LOGIN SCREEN UI LOGIC ==================================

// Socket
var socket = io();

var userListHidden = true;

// Shows or hides the user list
var toggleList = function() {
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

//================ 3) LOGIN SCREEN EVENTS ==============================

// Login button is clicked on login screen
loginButton.onclick = function() {
    socket.emit("login", {username:loginUsername.value,
			  password:loginPassword.value});
}

// Sign up button is clicked on login screen
signupButton.onclick = function() {
    socket.emit("signup", {username:loginUsername.value,
			   password:loginPassword.value});
}

// List users button is clicked on login screen
userListButton.onclick = function() {
    toggleList();
}

//================= 4) LOGIN SCREEN SOCKET LISTENERS =======================

// On successful login or signup, transition to game screen
socket.on("loginResponse", function(data) {
    if(data.success === true) {
	loginScreen.style.display = "none";
	gameScreen.style.display = "inline-block";
	usernameLabel.innerHTML = data.username;
	if(!userListHidden) toggleList();
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

// If input is pressed, emit object with the key and the new state
document.onkeydown = function(event) {
    if(event.keyCode === 68)
	socket.emit("keyPress", { inputId:"right", state:true});	
    else if(event.keyCode === 83)
	socket.emit("keyPress", { inputId:"down", state:true});
    else if(event.keyCode === 65)
	socket.emit("keyPress", { inputId:"left", state:true});
    else if(event.keyCode === 87)
	socket.emit("keyPress", { inputId:"up", state:true});
}

// If input is released, emit object with the key and the new state
document.onkeyup = function(event) {
    if(event.keyCode === 68)
	socket.emit("keyPress", { inputId:"right", state:false});	
    else if(event.keyCode === 83)
	socket.emit("keyPress", { inputId:"down", state:false});
    else if(event.keyCode === 65)
	socket.emit("keyPress", { inputId:"left", state:false});
    else if(event.keyCode === 87)
	socket.emit("keyPress", { inputId:"up", state:false});
}

//============= 6) GAME SCREEN SOCKET LISTENERS ===========================

// On successful logout, return to the login screen
socket.on("logoutResponse", function() {
    loginScreen.style.display = "inline-block";
    gameScreen.style.display = "none";
    usernameLabel.innerHTML = "";
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
chatForm.onsubmit = function(e) {
    e.preventDefault();
	// If input begins with a forward slash, treat as eval
    if(chatInput.value[0] === "/")
	socket.emit("evalServer", chatInput.value.slice(1));
    else
	socket.emit("sendMsgToServer", chatInput.value);
	// Clear the chat bar
    chatInput.value = "";
}

// Display the formatted chat post recieved from the server
socket.on("addToChat", function(data) {
    chatText.innerHTML += "<div>" + data + "<\div>";
});

// Log the eval answer recieved from the server to the console
socket.on("evalAnswer", function(data) {
    console.log(data);
});

//================== 8) TO DO ==========================================
/*
var saveGameButton = document.getElementById("saveGame-btn");
var savedGamesListButton = document.getElementById("savedGamesList-btn");

saveGameButton.onclick = function() {
    socket.emit("saveGame",filename);
}

savedGamesListButton.onclick = function() {
    toggleSavedGamesList();
}

socket.on("saveGameResponse", function(data) {
	
});

socket.on("savedGamesListResponse", function(data) {
    var i;
    userList.style.display = "table";
    var html = "<table><tr>" +
	"<th>Saved game<th></tr>";
    for(i = 0; i < data.length; i++) {	
	html += "<tr>" +
	    "<td>"+ data[i].filename + "</td></tr>";
    }
    html += "</table>";
    savedGamesList.innerHTML = html;
});

var savedGamesListHidden = true;

var toggleSavedGamesList = function() {
    if(savedGamesListHidden) {
	socket.emit("savedGamesListRequest");
	savedGamesListButton.innerHTML = "Hide game list";
	savedGamesListHidden = false;
    } else {
	savedGamesList.style.display = "none";
	savedGamesListButton.innerHTML = "Saved games list";
	savedGamesListHidden = true;
    }
}
*/
var socket = io();

/* User */
var loginScreen = document.getElementById("login-screen");
var loginUsername = document.getElementById("login-username");
var loginPassword = document.getElementById("login-password");
var loginButton = document.getElementById("login-btn");
var logoutButton = document.getElementById("logout-btn");
var signupButton = document.getElementById("signup-btn");
var usernameLabel = document.getElementById("username-label");

/* Chat */
var chatText = document.getElementById("chat-text");
var chatInput = document.getElementById("chat-input");
var chatForm = document.getElementById("chat-form");

/* Game */
var gameScreen = document.getElementById("game-screen");

loginButton.onclick = function() {
    socket.emit("login", {username:loginUsername.value,
			  password:loginPassword.value});
}

logoutButton.onclick = function() {
    socket.emit("logout");
}

signupButton.onclick = function() {
    socket.emit("signup", {username:loginUsername.value,
			   password:loginPassword.value});
}

socket.on("loginResponse", function(data) {
    if(data.success === true) {
	loginScreen.style.display = "none";
	gameScreen.style.display = "inline-block";
	usernameLabel.innerHTML = data.username;
    }
});

socket.on("logoutResponse", function() {
    loginScreen.style.display = "inline-block";
    gameScreen.style.display = "none";
    usernameLabel.innerHTML = "";
});

var canvas = document.getElementById("canvas").getContext("2d");
canvas.font = "30px Arial";

socket.on("newPositions", function(data) {
    canvas.clearRect(0, 0, 500, 500);
    for(var i = 0; i < data.length; i++) {
	canvas.fillText(data[i].number, data[i].x, data[i].y);
    }
});

socket.on("addToChat", function(data) {
    chatText.innerHTML += "<div>" + data + "<\div>";
});

socket.on("evalAnswer", function(data) {
    console.log(data);
});

chatForm.onsubmit = function(e) {
    e.preventDefault();
    if(chatInput.value[0] === "/")
	socket.emit("evalServer", chatInput.value.slice(1));
    else
	socket.emit("sendMsgToServer", chatInput.value);
    chatInput.value = "";
}

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

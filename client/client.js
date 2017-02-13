var chatText = document.getElementById("chat-text");
var chatInput = document.getElementById("chat-input");
var chatForm = document.getElementById("chat-form");

var canvas = document.getElementById("canvas").getContext("2d");
canvas.font = "30px Arial";

var socket = io();

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

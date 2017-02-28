
var express = require("express");
var app = express();
var serv = require("http").Server(app);
var io = require("socket.io")(serv, {});

var server = require("./server/server.js");

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
serv.listen(2000);

server.init();
server.run(io);


//var fs = require("fs");

module.exports.log = function(msg) {
    // output msg to console
    console.log(msg);

    // output msg to carib.log
    //fs.appendFile("carib.log","utf-8", msg);
}


// if (module.exports.<name> == true)
//       <name>.js will log debug output to console

module.exports.client = true; 
module.exports.chat = true; 
module.exports.router = true; 
module.exports.map = true;
module.exports.maps = true;


// Namespace
var files = function() {}

//=============== MODULES ==========================

var fs = require("fs");

//=============== FILE SYSTEM INTERFACE ===============

// Load text from file
files.prototype.readFile = function(filename, cb) {
    fs.open("fileName", "r", function(err, data) {
	if(err) {
	    console.log(err.message);
	    cb(null);
	} else {
	    cb(data);
	}
    });
    fs.close();
}

// Export module
module.exports = new files();

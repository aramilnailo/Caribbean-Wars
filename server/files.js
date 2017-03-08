
var debug = require("./debug.js").files;
var log = require("./debug.js").log;

/**
* The files namespace contains functions for interfacing
* with the file system.
*/
var files = function() {};

//=============== MODULES ==========================

var fs = require("fs");

//=============== FILE SYSTEM INTERFACE ===============

/**
* Reads from the given filename and calls back with the data.
* @param filename - path of the file to be read
* @param cb - callback function
*/
files.prototype.readFile = function(filename, cb) {
    if (debug) log ("readFile "+filename);
    fs.readFile(filename, "utf-8", function(err, data) {
	if(err) {
	    log(err.message);
	    cb(null);
	    if (debug) log("could not readFile "+filename);
	} else {
	    if (debug) log("sending " +filename);
	    cb(data);
	}
    });
}

// Export module
module.exports = new files();

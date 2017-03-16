
var debug = require("./debug.js").files;
var log = require("./debug.js").log;

/**
* The files namespace contains functions for interfacing
* with the file system.
* @module server/Files
*/
var Files = function() {};

//=============== MODULES ==========================

var fs = require("fs");

//=============== FILE SYSTEM INTERFACE ===============

/**
* Reads from the given filename and calls back with the data.
* @param filename - path of the file to be read
* @param cb - callback function
* @memberof module:server/Files
*/
Files.prototype.readFile = function(filename, cb) {
    if (debug) log ("server/files.js: readfile("+filename+")");
    fs.stat(filename, function(err,stats) {
	if (err) {
	    //log (err.code);
	    log(err.message);
	    cb(null);
	}
    });
    fs.readFile(filename, "utf-8", function(err, data) {
	if(err) {
	    log(err.message);
	    if (debug) log("server/files.js: could not readFile "+filename);
	    cb(null);
	} else {
	    if (debug) log("server/files.js: sending " +filename);
	    var obj = JSON.parse(data);
	    //if (debug) log(obj);
	    cb(obj);
	}
    });
}

/**
* Save text to file
* 
* @param filename
* @param data The data to write
* @param cb
*/
Files.prototype.saveFile = function(obj, filename, cb) {
    if (debug) log ("server/files.js: saveFile() "+filename);
    var json = JSON.stringify(obj);
    fs.writeFile(filename, json, "utf-8", function(err) {
	if(err) {
	    log(err.message);
	    cb(true);
	    if (debug) log("could not saveFile "+filename);
	} else {
	    if (debug) log("saving " +filename);
	    cb(false);
	}
    });
}


// Export module
module.exports = new Files();

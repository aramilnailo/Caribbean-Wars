
var debug = require("./debug.js").files;
var log = require("./debug.js").log;

// Namespace
var files = function() {};

//=============== MODULES ==========================

var fs = require("fs");

//=============== FILE SYSTEM INTERFACE ===============

// Load text from file
files.prototype.readFile = function(filename, cb) {
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
	    if (debug) log(obj);
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
files.prototype.saveFile = function(obj, filename, cb) {
    if (debug) log ("saveFile "+filename);
    // permet overwrite for now; alert later?
    /*
    var extant = fs.stat(filename, function(err,stats) {
	if (err) {
	    //log (err.code);
	    log(err.message);
	    return false;
	}
	else return true;
    });
    if (extant) {
    if(debug) log( "saveFile: attempt to overwrite" + filename);
    cb = false;
	else {
    */	
    var json = JSON.stringify(obj);
    fs.writeFile(filename, json, "utf-8", function(err) {
	if(err) {
	    log(err.message);
	    cb = false;
	    if (debug) log("could not saveFile "+filename);
	} else {
	    if (debug) log("saving " +filename);
	    cb = true;
	}
    });
}


// Export module
module.exports = new files();

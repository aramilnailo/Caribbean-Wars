
var debug = require("./debug.js").viewer;
var log = require("./debug.js").log;

var viewlogin = require("viewlogin.js");
var viewgame = require("viewgame.js");
var viewmapeditor = require("viewmapeditor.js");

var run = function() {

    var v = "login";

    while (true) {
	switch (v) {
	case "login" : {
	    if (debug) log ("viewer: calling viewlogin()");
	    v = viewlogin();
	    break;
	}
	case "game" : {
	    if (debug) log("viewer: calling viewgame()");
	    v = viewgame();
	    break;
	}
	case "mapeditor" : {
	    if (debug) log("viewer: calling viewmapeditor()");
	    v = viewmapeditor();
	    break;
	}
	default : {
	    if (debug) log("viewer: error; unhandled event (view=" + v +")");
	}
	}
    }
}

module.exports.run = run;
    

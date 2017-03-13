
var debug = require("./debug.js").dbi;
var log = require("./debug.js").log;

// Namespace creation
var dbi = function () {};

//============== MODULES ==============================
var mysql = require("mysql");

//============== DATABASE INIT ================================

// MySQL database object
var db = {};

// Creates initial connection to db
dbi.prototype.connect = function() {
    db = mysql.createConnection({
	host:"mysql.cs.iastate.edu",	
	user:"dbu309sr5",
	password:"NWI5ZTY0MzQw",
	database:"db309sr5"
    });
    db.connect(function(err) {
        if(err) {
	    if (debug) log(err.message);
	} else {
	    if (debug) log("Connected to database.");
	}
    });
}

//==================== VALIDATION ============================================


// Compares given username and password string to the user_info table
// Callback true if the info is valid, false if not or if errors occur
dbi.prototype.login = function(username, usertype, password, cb) {
    if (debug) log("server/dbi.js: login(): username="+username+"; usertype="+usertype); 

    if (usertype != "admin" || (usertype === "admin" && username === "admin") ) {
	if (usertype === "admin" || usertype === "player" || usertype === "host" || usertype === "editor" )  {

	    var sql = "SELECT * FROM ?? WHERE ??=? AND ??=?;";
	    var inserts = ["user_info", "username", username, "password", password];
	    db.query(mysql.format(sql, inserts), function(err, rows) {
		if(err) {
		    if (debug) log("server/dbi.js: login(): "+err.message);
		    cb(false);
		}
		if(rows.length == 0)  { //cb(true);
		    if (debug) log("server/dbi.js: login(): user does not exist");
		    cb(false);
		}
		if (debug) log("server/dbi.js: rows.length="+rows.length);
	    });

	    sql = "UPDATE ?? SET ??=? WHERE ??=?;";
	    inserts = ["user_info", "usertype", usertype, "username", username];
	    db.query(mysql.format(sql, inserts), function(err, rows) {
		if(err) {
		    if (debug) log("server/dbi.js: login(): "+err.message);
		    cb(false);
		} else {
		    if (debug) log("server/dbi.js: login(): good");
		    cb(true);
		}
		//if(rows.length > 0) cb(true);
		//cb(false);
	    });
	    cb(true);
	} else {
	    if (debug) log("server/dbi.js: login() usertype restrited to player, host, or editor");	    
	    cb(false);
	}
	
    } else {
	if (debug) log ("server/dbi.js: login(): Currently only admin can have admin usertype");
	cb(false);
    }

}

//==================== INSERTION ============================================

// Inserts given username and password set into user_info
// Callback true if username is not taken, false if it is or if errors occur
// ... may want to sign up simultaneously for player, host, and editor accounts simultaneously
dbi.prototype.signup = function(username, usertype, password, cb) {
    
    if (username != "admin" || (usertype === "admin" && username === "admin") ) {

	if (usertype === "player" || usertype === "host" || usertype === "editor") {
	
	    db.query("INSERT INTO user_info SET ?",
		     {username:username, usertype:usertype, password:password, online:false},
		     function(err) {
			 if(err) {
			     if (debug) log(err.message);
			     cb(false);
			 } else {
			     cb(true);
			 }
		     });
	} else {
	    if (debug) log ("Usertype limited to host, player, editor, or admin");
	    cb(false);
	}
    } else {
	if (debug) log ("Currently only admin can have admin usertype");
	cb(false);
    }
}

// Sets the online status of the given username to the given boolean value
dbi.prototype.setUserOnlineStatus = function(username, val) {
    var boolStr = "" + (val ? 1 : 0);
    var sql = "UPDATE ?? SET ??=? WHERE ??=?";
    var inserts = ["user_info", "online", boolStr, "username", username];
    db.query(mysql.format(sql, inserts), function(err) {
	if(err && debug) log(err.message);
    });
}

// Inserts the string 'filename' into the saved games database
dbi.prototype.saveGameFilename = function(data,cb) {
    if (data.file_name) {
	db.query("INSERT INTO saved_games SET ?;",
		 {author:data.author,
		  file_name:data.file_name,
		  map_file_path:data.map_file_path},
		 function(err) {
		     if(err) {
			 if (debug) log(err.message);
			 cb(false);
		     } else {
			 cb(true);
		     }
		 });
    } else {
	cb(false);
    }
}


//=================== DELETION ===============================================

dbi.prototype.removeUser = function(name, cb) {
    var sql = "DELETE FROM ?? WHERE ??=?";
    var inserts = ["user_info", "username", name];
    db.query(mysql.format(sql, inserts), function(err) {
	if(err) {
	    if (debug) log(err.message);
	    cb(false);
	} else {
	    cb(true);
	}
    });
}

// check admin status here?
dbi.prototype.removeSavedGame = function(data, cb) {
    var sql = "DELETE FROM ?? WHERE ??=? AND (??=? OR ?=?)";
    var inserts = ["saved_games", "file_name", data.file_name,
		   "author", data.author, data.author, "admin"];
    db.query(mysql.format(sql, inserts), function(err, rows) {
		if(err) {
		    if (debug) log(err.message);
		    cb(false);
		} else if(rows.affectedRows > 0) {
		    cb(true); // If a successful deletion occurred
		} else {
		    cb(false);
		}
	});
}

//=================== RETRIEVAL =================================================

// Retrieves all the table data, and passes it to the callback as an array of rows
dbi.prototype.getAllUserInfo = function(cb) {
    db.query("SELECT * FROM user_info;", function(err, rows) {
	if(err) {
	    if (debug) log(err.message);
	    cb({});
	} else {
	    cb(rows);
	}
    });
}

// Retrieves the saved games table
dbi.prototype.getSavedGamesList = function(cb) {
    db.query("SELECT * FROM saved_games;", function(err, rows) {
	if(err) {
	    if (debug) log(err.message);
	    cb(null);
	} else {
	    cb(rows);
	}
    });
}

// Retrieves the map file path from the saved games table
dbi.prototype.getMapFilePath = function(file_name, cb) {
    if (debug) log("dbi.js: getMapFilePath("+file_name+")");
    var sql = "SELECT * FROM ?? WHERE ??=?";
    var inserts = ["saved_games", "file_name", file_name];
    db.query(mysql.format(sql, inserts), function(err, rows) {
	if(err) {
	    if (debug) log(err.message);
	    cb(null);
	} else if(rows.length > 0) {
	    cb(rows[0].map_file_path);
	} else {
	    cb(null);
	}
    });
}


//============================= STATS ===================================

dbi.prototype.addUserStats = function(username, cb) {
    var newUser = {username:username, seconds_played:0,
		   shots_fired:0, distance_sailed:0,
		ships_sunk:0, ships_lost:0};
    var sql = "INSERT INTO ?? SET ?;";
    var inserts = ["user_stats", newUser];
    db.query(mysql.format(sql, inserts), function(err) {
	if(err) {
	    if (debug) log(err.message);
	    cb(false);
	} else {
	    cb(true);
	}
    });
}

dbi.prototype.removeUserStats = function(username, cb) {
    var sql = "DELETE FROM ?? WHERE ??=?";
    var inserts = ["user_stats", "username", username];
    db.query(mysql.format(sql, inserts), function(err) {
	if(err) {
	    if (debug) log(err.message);
	    cb(false);
	} else {
	    cb(true);
	}
    });
}

// Retrieves stored value for provided stat and username
dbi.prototype.getStat = function(username, usertype, stat, cb) {
    var sql = "SELECT ?? FROM ?? WHERE ??=?";
    var inserts = [stat, "user_stats", "username", username];
    db.query(mysql.format(sql, inserts), function(err, rows) {
	if(err) {
	    if (debug) log(err.message);
	    cb(null);
	} else {
	    if (debug) log("debug: stat retrieved:" + rows);
	    cb(rows);
	}
    });
}

// Sets given stat for given user. cb set to false if no errors occured.
dbi.prototype.setStat = function(username, usertype, stat, newval, cb){
    var sql = "UPDATE ?? SET ??=? WHERE username=?";
    var inserts = ["user_stats" ,stat, newval, username];
    db.query(mysql.format(sql, inserts), function(err) {
	if(err){
	    if (debug) log(err.message);
	    cb(false);
	} else {
	    if (debug) log("Changed " + username + " " +
			stat + " to " + newval);
	    cb(true);
	}
    });
}

// Updates the given stat by the given amount
dbi.prototype.updateStat = function(username, stat, diff, cb) {
    var sql = "UPDATE ?? SET ??=??+? WHERE ??=?;";
    var inserts = ["user_stats", stat, stat, diff, "username", username];
    db.query(mysql.format(sql, inserts), function(err, rows) {
	if(err) {
	    if (debug) log(err.message);
	    cb(false);
	} else {
	    cb(true);
	}
    });
}

dbi.prototype.getAllStats = function(cb) {
    var sql = "SELECT * FROM ??";
    var inserts = ["user_stats"];
    db.query(mysql.format(sql, inserts), function(err, rows) {
	if(err) {
	    if (debug) log(err.message);
	    cb(null);
	} else {
	    cb(rows);
	}
    });
}

module.exports = new dbi();

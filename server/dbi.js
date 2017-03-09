/**
 * @module server/dbi
 */
var debug = require("./debug.js").dbi;
var log = require("./debug.js").log;

/**
 * The dbi namespace contains the functions related
 * to interacting with the database
 */
var dbi = function () {};

//============== MODULES ==============================
var mysql = require("mysql");

//============== DATABASE INIT ================================

// MySQL database object
var db = {};

/**
 * Establishes connection with the database.
 * @memberof module:server/dbi
 */
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

/**
 * Checks whether the input username and password match the data stored
 * in the user_info table in the database
 * @param username - the username to be checked
 * @param password - the password to be checked
 * @param cb - callback function. Returns true if info is valid and no errors, false otherwise
 * @memberof module:server/dbi
 */
dbi.prototype.login = function(username, password, cb) {
    var sql = "SELECT * FROM ?? WHERE ??=? AND ??=?;";
    var inserts = ["user_info", "username", username, "password", password];
    db.query(mysql.format(sql, inserts), function(err, rows) {
	if(err) {
	    if (debug) log(err.message);
	    cb(false);
	}
	if(rows.length > 0) cb(true);
	cb(false);
    });
}

//==================== INSERTION ============================================


/**
 * Attempts to add a row to the user_info table in the database with the given
 * username and password
 * @param username - the username to be added
 * @param password - the password to be added
 * @param cb - callback function. Returns true if username not taken and no errors, false otherwise
 * @memberof module:server/dbi
 */
dbi.prototype.signup = function(username, password, cb) {
    db.query("INSERT INTO user_info SET ?",
             {username:username, password:password, online:false},
	function(err) {
	    if(err) {
		if (debug) log(err.message);
		cb(false);
	    } else {
		cb(true);
	    }
	});
}


/**
 * Sets the online status for the given username to the given boolean value
 * @param username - the username to check against
 * @param val - the new value for online status
 * @memberof module:server/dbi
 */
dbi.prototype.setUserOnlineStatus = function(username, val) {
    var boolStr = "" + (val ? 1 : 0);
    var sql = "UPDATE ?? SET ??=? WHERE ??=?";
    var inserts = ["user_info", "online", boolStr, "username", username];
    db.query(mysql.format(sql, inserts), function(err) {
	if(err && debug) log(err.message);
    });
}

// Inserts the string 'filename' into the saved games database

/**
 * Inserts a new row into the saved_games table in the database containing a new map file
 * @param data - the packet containing the needed data
 * @param data.file_name - the name of the file to be added
 * @param data.author - the username of the user who is adding the map
 * @param data.map_file_path - the location of the map file
 * @param cb - callback function. returns true if successful with no errors, false otherwise
 * @memberof module:server/dbi
 */
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

/**
 * Removes the given user from the user_info table in the database
 * @param name - the username to be removed
 * @param cb - callback function. returns true if succeeded with no errors, false if otherwise
 * @memberof module:server/dbi
 */
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

/**
 * Removes the given map from the saved_games table in the database
 * @param data - packet containing needed data
 * @param data.file_name - name of the file to be deleted
 * @param data.author - name of user who's file is to be deleted
 * @param cb - callback function. returns true if succeeded with no errors, false if otherwise 
 * @memberof module:server/dbi
 */
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

/**
 * Retrieves all of the information stored on the user_info table on the database
 * @param cb - callback function. returns an array of the rows if succeeded with no errors, empty array otherwise
 * @memberof module:server/dbi
 */
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


/**
 * Retrieves all of the information stored on the saved_games table on the database
 * @param cb - callback function. returns an array of the rows if succeeded with no errors, null otherwise
 * @memberof module:server/dbi
 */
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

/**
 * Retrieves the file path for the given map from the saved_games table on the database
 * @param file_name - the name of the file to be located
 * @param cb - callback function. returns the file path if succeeded with no errors, null otherwise
 * @memberof module:server/dbi
 */
dbi.prototype.getMapFilePath = function(file_name, cb) {
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

/**
 * Adds a new row to the user_stats table on the database
 * @param username - the username to be added
 * @param cb - callback function. returns true if succeeded with no errors, false otherwise
 * @memberof module:server/dbi
 */
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

/**
 * Removes a row from the user_stats table on the database
 * @param username - user to be removed
 * @param cb - callback function. returns true if succeeded with no errors, false otherwise
 * @memberof module:server/dbi
 */
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


/**
 * Retrieves the stored value for the provided stat and username from
 * the user_stats table on the database
 * @param username - the user to check
 * @param stat - the stat to be retrieved
 * @param cb - callback function. returns the stat as a row object if succeeded with no errors, null otherwise
 * @memberof module:server/dbi
 */
dbi.prototype.getStat = function(username, stat, cb) {
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

/**
 * Sets the value of the provided stat on the user_stats table
 * on the database to the given value
 * @param username - the user to have a stat updated
 * @param stat - the stat to be updated
 * @param newval - the new value for the stat
 * @param cb - callback function. returns true if succeeded with no errors, false otherwise
 * @memberof module:server/dbi
 */
dbi.prototype.setStat = function(username, stat, newval, cb){
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
/**
 * Adds the given amount to the given stat on the user_stats
 * table on the database.
 * @param username - the user to have a stat updated
 * @param stat - the stat to be updated
 * @param diff - the amount to modify the stat by, can be negative
 * @param cb - callback function. returns true if succeeded with no errors, false otherwise
 * @memberof module:server/dbi
 */
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

/**
 * Retrieves all data from the user_stats table on the database
 * @param cb - callback function. returns an array of the rows if successful with no errors, null otherwise
 * @memberof module:server/dbi
 */
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

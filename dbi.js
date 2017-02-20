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
	    console.log(err.message);
	} else {
	    console.log("Connected to database.");
	}
    });
}

//==================== VALIDATION ============================================


// Compares given username and password string to the user_info table
// Callback true if the info is valid, false if not or if errors occur
dbi.prototype.login = function(username, password, cb) {
    var sql = "SELECT * FROM ?? WHERE ??=? AND ??=?;";
    var inserts = ["user_info", "username", username, "password", password];
    db.query(mysql.format(sql, inserts), function(err, rows) {
	if(err) {
	    console.log(err.message);
	    cb(false);
	}
	if(rows.length > 0) cb(true);
	cb(false);
    });
}

//==================== INSERTION ============================================

// Inserts given username and password set into user_info
// Callback true if username is not taken, false if it is or if errors occur
dbi.prototype.signup = function(username, password, cb) {
    db.query("INSERT INTO user_info SET ?",
             {username:username, password:password, online:false},
	function(err) {
	    if(err) {
		console.log(err.message);
		cb(false);
	    } else {
		cb(true);
	    }
	});
}

// Sets the online status of the given username to the given boolean value
dbi.prototype.setUserOnlineStatus = function(username, val) {
    var boolStr = "" + (val ? 1 : 0);
    var sql = "UPDATE ?? SET ??=? WHERE ??=?";
    var inserts = ["user_info", "online", boolStr, "username", username];
    db.query(mysql.format(sql, inserts), function(err) {
	if(err) console.log(err.message);
    });
}

// Inserts the string 'filename' into the saved games database
dbi.prototype.saveGameFilename = function(data,cb) {
    if (data.file_name) {
	db.query("INSERT INTO saved_games set ?;",
		 {user_name:data.user_name,
		  file_name:data.file_name,
		  map_file_path:data.map_file_path},
		 function(err) {
		     if(err) {
			 console.log(err.message);
			 cb({value:false});
		     } else {
			 cb({value:true,
			     username:data.user_name,
			     filename:data.file_name});
		     }
		 });
    } else {
		cb({value:false});
	}
}


//=================== DELETION ===============================================

dbi.prototype.removeUser = function(name, cb) {
	var sql = "DELETE FROM ?? WHERE ??=?";
	var inserts = ["user_info", "username", name];
	db.query(mysql.format(sql, inserts), function(err) {
		if(err) {
			console.log(err.message);
			cb(false);
		} else {
			cb(true);
		}
	});
}

dbi.prototype.removeSavedGame = function(data, cb) {
	var sql = "DELETE FROM ?? WHERE ??=? AND (??=? OR user_name='admin')";
        var inserts = ["saved_games", "file_name", data.filename, "user_name", data.username];
	db.query(mysql.format(sql, inserts), function(err) {
		if(err) {
			console.log(err.message);
			cb(false);
		} else {
			cb(true);
		}
	});
}

//=================== RETRIEVAL =================================================

// Retrieves all the table data, and passes it to the callback as an array of rows
dbi.prototype.getAllUserInfo = function(cb) {
    db.query("SELECT * FROM user_info;", function(err, rows) {
	if(err) {
	    console.log(err.message);
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
	    console.log(err.message);
	    cb(null);
	} else {
	    cb(rows);
	}
    });
}

// Retrieves the map file path from the saved games table
dbi.prototype.getMapFilePath = function(file_name, cb) {
    var sql = "SELECT * FROM ?? WHERE ??=?";
    var inserts = ["saved_games", "file_name", file_name];
    db.query(mysql.format(sql, inserts), function(err, rows) {
	if(err) {
	    console.log(err.message);
	    cb(null);
	} else if(rows.length > 0) {
	    cb(rows[0].map_file_path);
	} else {
	    cb(null);
	}
    });
}

module.exports = new dbi();

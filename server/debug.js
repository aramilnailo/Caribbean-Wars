
/**
* Handles debugging messages.
* @param msg - message to be handled
*/
module.exports.log = function(msg) {
    //output msg to console
    console.log(msg);
    // todo: output msg to log file
}

/**
* Flags for debugging.
*/
module.exports.accounts = true; 
module.exports.chat = true; 
module.exports.dbi = true; 
module.exports.game = true; 
module.exports.session = true; 
module.exports.maps = true; 
module.exports.server = true; 
module.exports.router = true; 
module.exports.saves = true;
module.exports.stats = true;
module.exports.autopilot = true;

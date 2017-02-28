

module.exports.log = function(msg) {
    //output msg to console
    console.log(msg);
    // todo: output msg to log file
}

// if (module.exports.<name> == true)
//       <name>.js will log debug output to console
module.exports.accounts = true; 
module.exports.chat = true; 
module.exports.dbi = true; 
module.exports.files = true; 
module.exports.game = true; 
module.exports.session = true; 
module.exports.maps = true; 
module.exports.player = true; 
module.exports.server = true; 
module.exports.router = true; 
module.exports.saves = true;
module.exports.stats = true;
module.exports.map = true;

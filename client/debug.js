/**
* Flags used to control debug output.
*
* @module client/debug
*/
define([], function() {

var debugall = false;

var debug = {
    client:debugall||true,
    router:debugall||true,
    chat:debugall||true,
    saves:debugall||true,
    login:debugall||true,
    stats:debugall||true,
    render:debugall||true,
    view:debugall||true,
    viewmapeditor:debugall||true
}

/**
* Wrapper to determine processing of debug message.
*
* @memberof module:client/debug
* @param msg String to log as debug output
*/
debug.log = function(msg) {
    console.log(msg);
}

return debug;

});

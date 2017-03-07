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

debug.log = function(msg) {
    console.log(msg);
}

return debug;

});

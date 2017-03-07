
define(["debug","dom","client"],function(debug,dom,client) {

    var MapEditorIcon = function (name) {
	var icon = {
	    type:name,
	    active:false,
	    upimg:null,
	    downimg:null,
	};
	return icon;
    }
    
    //////////////
    //  Event handlers
    //////////////
    /**
     *
     */
    MapEditorIcon.prototype.up = function() {
	this.active = false;
    };
    
    
    /**
     *
     */
    MapEditorIcon.prototype.down = function() {
	this.active = true;
    };
        
    
    
};

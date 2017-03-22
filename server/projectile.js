
//===== PROJECTILE OBJECT =======


var Projectile = function() {
	
	var proj = {
		box:{
			x:0,
			y:0,
			w:0.2,
			h:0.2,
			dir:0,
			dx:0,
			dy:0,
			hit:false,
			stuck:false
		},
		range:20,
		active:false
	};
	
	return proj;
}

module.exports = Projectile;
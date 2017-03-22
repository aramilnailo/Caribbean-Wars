
//===== PROJECTILE OBJECT =======


var Projectile = function() {
	
	var proj = {
		box:{
			x:-1,
			y:-1,
			w:0.2,
			h:0.2,
			dir:0
		},
		dx:1.5,
		dy:1.5,
		range:20,
		active:false
	};
	
	return proj;
}

module.exports = Projectile;
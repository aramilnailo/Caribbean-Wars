
//===== PROJECTILE OBJECT =======


var Projectile = function(player) {
	
	var proj = {
		box:{
			x:0,
			y:0,
			w:0.5,
			h:0.5,
			dir:0,
			ddir:0,
			dx:0,
			dy:0,
			dx_max:100,
			dy_max:100,
			mass:0.5,
			
			hit:false,
			stuck:false,
			verts:[],
			collisions:[],
			name:player.name
		},
		range:20,
		active:true,
	};
	
	proj.box.dir = player.box.dir + (3 * Math.PI / 2);
	
	var v = player.box.verts;
	var cannons = [
		{ x:v[0].x, y:v[0].y },
		{ x:v[1].x, y:v[1].y },
		{ x:(v[0].x + v[1].x) / 2,
			y:(v[0].y + v[1].y) / 2 }
	];
	var index = Math.floor(Math.random() * 3);
	proj.box.x = cannons[index].x;
	proj.box.y = cannons[index].y;
	
	var x1 = proj.box.x - proj.box.w / 2,
	x2 = proj.box.x + proj.box.w / 2,
	y1 = proj.box.y - proj.box.h / 2,
	y2 = proj.box.y + proj.box.h / 2;

	proj.box.verts.push({ x:x1, y:y2 }); // 3	
	proj.box.verts.push({ x:x2, y:y2 }); // 2
	proj.box.verts.push({ x:x2, y:y1 }); // 1
	proj.box.verts.push({ x:x1, y:y1 }); // 0
	
	return proj;
}

module.exports = Projectile;
var Resource = function(x, y) {
	
	var res = {
		box:{
			x:x, 
			y:y, 
			w:1, 
			h:1.5,
			dir:0,
			ddir:0,
			
			dx:0,
			dy:0,

			dx_max:0.5,
			dy_max:0.5,
			mass:2,
			
			hit:false,
			stuck:false,
			verts:[],
			collisions:[],
			name:"a barrel"
		},
		contents:[],
		active:true,
		health:5
	};
	
	var x1 = res.box.x - res.box.w / 2,
	x2 = res.box.x + res.box.w / 2,
	y1 = res.box.y - res.box.h / 2,
	y2 = res.box.y + res.box.h / 2;

	res.box.verts.push({ x:x1, y:y2 }); // 3	
	res.box.verts.push({ x:x2, y:y2 }); // 2
	res.box.verts.push({ x:x2, y:y1 }); // 1
	res.box.verts.push({ x:x1, y:y1 }); // 0

	return res;
};

module.exports = Resource;
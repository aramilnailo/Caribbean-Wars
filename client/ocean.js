/**
* Class responsible for rendering the ocean
* on client system.
*
* @module client/Ocean
*/
define(["debug", "dom", "client"], function(debug, dom, client) {

    var log = debug.log;
    var debug = debug.render;

    var CANVAS_W = 500, CANVAS_H = 500;
    var nwaves = 12;
    var nmin = 5;
    var nmax = 20;
    var amp_min = 0.02;
    var amp_max = 0.1;
    var B = 10.0;
    var C = 2.0;
    var tmax = 999999;
    
    var Ocean = function() {

	this.waves = [];   // {nx:nx,ny:ny,amp:amp}
	this.time = 0;

	for (var n = 0; n < nwaves; n++) {

	    var amp = (amp_max-amp_min)*Math.random() + amp_min;

	    var nx = Math.floor(nmax*(Math.random()*2.0-1.0));
	    if (Math.abs(nx) < nmin) nx = (nx < 0) ? -nmin : nmin;

	    var ny = Math.floor(nmax*(Math.random()*2.0-1.0));
	    if (Math.abs(ny) < nmin) ny = (ny < 0) ? -nmin : nmin;

	    var phi = 6.28318530718*Math.random();

	    var lam = nx*nx/(CANVAS_H*CANVAS_H) + ny*ny/(CANVAS_W*CANVAS_W);
	    var slam = Math.sqrt(lam);
	    var fac = Math.abs(nx*ny)/(CANVAS_W*CANVAS_H);
	    
	    var speed = Math.sqrt(B*lam*slam/fac + C*fac*slam);

	    nx *= 3.1415912654/CANVAS_H;
	    ny *= 3.1415912654/CANVAS_W;
	    
	    this.waves.push({nx:nx,ny:ny,amp:amp,phi:phi,speed:speed});
	}

	this.grid = [];
	for (var n = 0; n < CANVAS_W*CANVAS_H; n++) this.grid.push(0.0);
    };

    // eqns: omega = c |k| = c sqrt(kx^2+ky^2)
    //       lambda = 2L/n
    //       c = sqrt[ g lambda / (2pi) + 2pi *S / (rho lambda) ]
    //       h(x,y,t) = sum_i A_i sin(kx(x-x0) + ky(y-y0) - omega.t + phi)

    // h(x,y,t) = sum_i amp_i sin {{
    //                               pi*(nx.(x-x0)/W + ny.(y-y0)/H)
    //                                 + t . sqrt[ (B/r) q^(3/2)
    //                                             (C.r) q^(1/2) ]
    //                              }}
    // with B = g pi,
    //      C = pi^3 S/rho  (S = water surf tension, rho = water density)
    // and q = nx^2/W + ny^2/H,
    //     r = nxny/WH
    
   
    /**
     *
     */
    Ocean.prototype.update = function() {	
	
	for (var g = 0; g < CANVAS_W*CANVAS_H; g++)
	    this.grid[g] = 0.0;
	
	this.time += 0.1;
	if (this.time > tmax)
	    this.time -= Math.floor(this.time/6.28318530718)*6.28318530718;

	var term1,term2;
	var n,x,y;
	var ind;
	for (n = 0; n < nwaves; n++) {
	    term1 = this.time*this.waves[n].speed + this.waves[n].phi;

	    for (var x = 0; x < CANVAS_H; x++) {
		term2 = this.waves[n].nx*x + term1;
		ind = CANVAS_W*x;
		for (var y = 0; y < CANVAS_W; y++) {
		    this.grid[y + ind] +=
			( this.waves[n].amp*Math.sin( term2
						      + this.waves[n].ny*y ) );
		}
	    }
	}
    }

    /**
     *
     */
    //var cnt = 2;
    var first = true;
    Ocean.prototype.renderOcean = function() {

	//cnt++;
	//if (cnt % 5 === 0) {
	    //if (cnt % 10 === 0)
	    this.update();
	    //cnt++;

	var id = dom.oceanCanvas.createImageData(CANVAS_W,CANVAS_H);
	var d = id.data;

	// camera position in cells
	var cam_x = client.camera.x;
	var cam_y = client.camera.y;
	var min = Math.min(client.map.width, client.map.height);
	var cam_w = Math.floor(min / client.camera.zoom);
	var cam_h = Math.floor(min / client.camera.zoom);
	// cell dimensions in pixels
	var cell_w = CANVAS_W / cam_w;
	var cell_h = CANVAS_H / cam_h;
	var zoom = Math.floor(client.camera.zoom);

	var cx = Math.floor(cam_y/cell_h);
	var cy = Math.floor(cam_x/cell_w);

	for (var i = 0; i < CANVAS_H;) {
	    var u = i + cx;
	    //if (u < 0) u += CANVAS_H;
	    if (u >= CANVAS_H) u -= CANVAS_H;
	    var du = CANVAS_W*u;
	    for (var p = 0; p < zoom; p++) {
		for (var j = 0; j < CANVAS_W;) {
		    var v = j + cy;
		    if (v >= CANVAS_W) v -= CANVAS_W;
		    var off = v + du;
		    var value = Math.min(this.grid[off],1.0);
	            for (var q = 0; q < zoom; q++) {
			off = 4*(v + du);
			d[off] = 255;
			d[off+1] = 255;
			d[off+2] = 255;
			d[off+3] = Math.floor(255*value);
			j++;
			v++;
			if (v >= CANVAS_W) v -= CANVAS_W;
		    }
		}
		i++;
		du += CANVAS_W;
	    }
	}

	dom.oceanCanvas.putImageData(id,0,0);
	//}
    }

   
    return new Ocean();
});

var debug = require("./debug.js").dijkstra;
var log = require("./debug.js").log;

var Heap = require("./heap.js");

var BIG = 9999999;


function checkWater(x,y,session) {
    
}

function Dijkstra(pos,target) {

    // create vertex array.
    var ux = (pos.x - target.x)*0.5 + (pos.y - target.y)*0.5;
    var uy = (pos.y - target.y)*0.5 - (pos.x - target.x)*0.5;
    
    
    if (ux*ux > delta) {
	
	var vx = (pos.x - target.x)*0.5 - (pos.y - target.y)*0.5;
	var vy = (pos.y - target.y)*0.5 + (pos.x - target.x)*0.5;
	
		
	// consttruct short array.
	var i,j,ind;
	var ipos = 0;
	var imin = 0;
	var imax = 10;
	var inum = imax-imin;
	var jpos = 0;
	var jmin = 0;
	var jmax = 10;
	var jnum = jmax-jmin;
	
	var arr = [];
	for (i = imin; i < imax; i++)
	    for (j = jmin; j < jmax; j++) {
		distance = (i == ipos && j == jpos) ? 0 : BIG;
		tx = r0.x + (i/nbox)*u.x + (j/nbox)*v.x;
		ty = r0.y + (i/nbox)*u_y + (j/nbox)*v.y;
		ind = (i-imin)*jnum+j-jmin;
		if (checkWater(tx,ty)) {
		    arr[ind] = { x : tx, y : ty, d:distance};
		} else {
		    arr[ind] = null;
		}
	    }
	
	for (var n in arr) 
	    arr[n].edgelist = [];
	
	var aij,ni,nj,nindx;
	var nbrx = [0,0,1,1,1,-1,-1,-1];
	var nbry = [1,-1,1,0,-1,1,0,-1];
	var ndist = [1,1,2,1,2,2,1,2];
	for (i = imin; i < imax; i++)
	    for (j = jmin; j < jmax; j++) {
		aij = arr[(i-imin)*jnum+j-jmin];
		if (aij.good) {
		    for (nbr = 0; nbr < 6 ; nbr++) {
			ni = i + nbrx[nbr];
			if (ni >= imin && ni < imax) {			
			    nj = j + nbry[nbr];
			    nindx = (nj-imin)*jnum+nj-jmin;
			    if (nj >= jmin && nj < jmax && arr[nindx] !== null) {
				arr[nindx].edgelist.push({vert:aij,
							  wt:ndist[nbr]});
			    }
			    
			}
		    }
		}
	    }

	// minheap, ordered by distance d
	var q = new Heap();
	
	for (var n in arr) {
	    // dist already set.
	    arr[n].prev = null;
	    q.push(arr[n]);
	}

	// based on wikipedia pseudocode
	var vert, edge,newdist;
	while (q.array.length > 0) {
	    vert = q.pop();
	    if (vert.x == target.x && vert.y == target.y) break;
	    dist = vert.d;
	    for (n in vert.edgelist) {
		edge = vert.edgelist[n];
		newdist = dist + edge.wt;
		if (newdist < edge.vert.d) {
		    // note: remove does not seem to work yet
		    r = q.remove(edge.vert);
		    r.d = newdist;
		    r.prev = vert;
		    q.push(r);
		    //modify edge.vert.d; reinsert.
		}
	    }
	}

	
	
    }

    
}

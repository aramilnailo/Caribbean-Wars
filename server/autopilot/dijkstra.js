var debug = require("./debug.js").dijkstra;
var log = require("./debug.js").log;

var Heap = require("./heap.js");

var BIG = 9999999;
var SMALL = 0.01;

function checkWater(x,y,session) {
    
}

// check obvious straight-line solution
// prior to call

/**
* 
* @return path an array of points [{x,y}, ...]
*/
function Dijkstra(pos,target,bnds,session) {
    
    // create vertex array.
    var ux = (pos.x - target.x)*0.5 + (pos.y - target.y)*0.5;
    var uy = (pos.y - target.y)*0.5 - (pos.x - target.x)*0.5;
    
    
    if (ux*ux > SMALL) {
	
	var vx = (pos.x - target.x)*0.5 - (pos.y - target.y)*0.5;
	var vy = (pos.y - target.y)*0.5 + (pos.x - target.x)*0.5;
	
		
	// consttruct short array.
	var i,j,ind;
	var ipos = 0;
	var imin = bnds.imin;
	var imax = bnds.imax;
	var inum = imax-imin;
	var jpos = 0;
	var jmin = bnds.jmin;
	var jmax = bnds.jmax;
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
	var vert, edge, newdist;	
	while (q.array.length > 0) {
	    vert = q.pop();
	    // note: vert holds target vert at loop exit
	    if (vert.x == target.x && vert.y == target.y) break;
	    dist = vert.d;
	    for (n in vert.edgelist) {
		edge = vert.edgelist[n];
		newdist = dist + edge.wt;
		if (newdist < edge.vert.d) {
		    //modify edge.vert.d; reinsert.
		    //    note: there is probably a better
		    //          way to implement decreaseKey
		    r = q.remove(edge.vert);
		    r.d = newdist;
		    r.prev = vert;
		    q.push(r);
		}
	    }
	}
    }

    var path = [];

    if (vert.x == target.x && vert.y == target.y) {
	while (vert.x != pos.x || vert.y != pos.y) {
	    path.push({x:vert.x,y:vert.y});
	    vert = vert.prev;
	}
	path.push({x:vert.x,y:vert.y});
    }
    
    return path;
    
}

module.exports = Dikjstra;

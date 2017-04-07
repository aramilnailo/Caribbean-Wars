var debug = require("./debug.js").heap;
var log = require("./debug.js").log;


// derived from http://eloquentjavascript.net/1st_edition/appendix2.html
/**
* Min heap of weighted objects.
* @module server/Heap
*/
var Heap = function() {
    this.array = [];
}

/**
* Push weighted elements into minheap.
*
* @memberof module:server/Heap
* @param e : {obj:o,d:weight}
*/
Heap.prototype.push = function(e) {
    this.array.push(e);
    this.bubbleup(this.array.length-1);
}

/**
* Pop minimal element from minheap.
*
* @memberof module:server/Heap
* @return e: {obj:o, wt:w}
*/
Heap.prototype.pop = function() {
    var rtn = this.array[0];
    var last = this.array.pop();
    if (this.array.length > 0) {
	this.array[0] = last;
	this.sink(0);
    }
    return rtn;
}

/**
* Remove element from the heap
* used in simple decreasekey 
* 
* @memberof module:server/Heap
* @param 
* 
*/
Heap.prototype.remove = function(n) {
    var arr = this.array;
    var len = arr.length;
    
    var i;
    var replace;
    for (i = 0; i < len; i++) {
	
	if (arr[i].o !== n.o && arr[i].d !== n.d) continue;
	replace = this.array.pop();
	if (i == len-1) break;
	this.array[i] = replace;
	this.bubbleup(i);
	this.sink(i);
	break;
    }
}


/**
* Restore minheap order
*
* @memberof module:server/Heap
* @param n array index to bubble up
*/
Heap.prototype.bubbleup = function(n) {

    var arr = this.array;
    
    var e = arr[n];
    var wt = e.d;
    var p, pn, pwt;
    
    while (n > 0) {
	pn = Math.floor((n+1)/2) - 1;
	pwt = arr[pn].d;
	if (wt >= pwt) break;
	p = arr[pn];
	arr[pn] = e;
	arr[n] = p;
	n = pn;
    }
}


/**
* Restore minheap order
*
* @memberof module:server/Heap
* @param n array index to sink
*/
Heap.prototype.sink = function(n) {

    var arr = this.array;
    var len = arr.length;
    var e = arr[n];
    var ewt = e.d;

    var left, l, lwt;
    var right, r, rwt;
    var swap, swt;
    var twt;
    
    while (true) {
	l = (n+1)*2;
	r = l-1;
	swap = null;
	twt = ewt;
	if (l < len) {
	    lwt = arr[l].d;
	    if (lwt < ewt) {
		swap = l;
		twt = lwt;
	    }
	}

	if (r < len) {
	    rwt = arr[r].d;
	    if (rwt < twt) {
		swap = r;
	    }
	}
	
	if (swap == null) break;
	arr[n] = arr[swap];
	arr[swap] = e;
	n = swap;
    }
}



module.exports = Heap;

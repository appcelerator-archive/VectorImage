
DEBUG_calculatePixelSize = false;
DEBUG_vMinus = false;
DEBUG_closestInBounds = false;

/**
 *	Returns a number that is greater than number returned last time this function was called. Can be used to ensure ids are unique
 */
exports.sequence = function() {
	return __sequence++;
};
var __sequence = 1;
 
var dc = Ti.Platform.displayCaps;

/**
 *	Translate sizes/coordinates to pixels
 *	@param spec {string} the size/coordinate to translate
 *	@param direction {string} either "vertical" or "horizonal"
 */
exports.calculatePixelSize = function(spec, direction, containerSize) {
	
	var specUnits = 'dp';
	var specValue = 0;
	if(typeof spec === 'string') {
		var unitsMatch = /^([0-9]+\.?[0-9]*)([a-z%]+)$/.exec(spec);
		if(unitsMatch && unitsMatch.length > 0) {
			specUnits = unitsMatch[2];
			specValue = unitsMatch[1];
		} else {
			specValue = new Number(spec);
			if(isNaN(specValue)) {
				throw new Error("spec " + spec + " is not valid.");
			}
		}
	} else if(typeof spec === 'number') {
		specUnits = 'dp';
		specValue = spec;
	}

	var result = -1;
	var dpi = OS_ANDROID ? ("horizontal" === direction ? dc.xdpi : dc.ydpi) : dc.dpi;  

	switch(specUnits) {
	case 'px':
		result = specValue;
		break;
	case 'dip':
	case 'dp':
		result = specValue * (OS_ANDROID ? dc.logicalDensityFactor : ("high" === dc.density ? 2 : 1));
		break;
	case 'in': 
		result = specValue*dpi;
		break;
	case 'mm':
		result = specValue*dpi/25.4;
		break;
	case 'cm':
		result = specValue*dpi/2.54;
		break;
	case 'pt':
		result = specValue*dpi/72.0;
		break;
	case '%':
		result = specValue*containerSize/100;
		break;
	default:
		throw new Error("spec " + spec + " has unknown units");
	}

	return Math.round(result);
};

/**
 *  Converts {top, left, bottom, right, width, height, center} into a Dimension using the same rules as in a composite
 *  layout in view. Given the spec, it must be possible to calculate the width and the height or this will result in an
 *  exception. For example, if only the top, bottom, xor center.y are specified, the height cannot be calculated.
 *  The viewSize is and x,y size of the containing view
 */
/*exports.calculateBounds = function(spec, viewSize) {
	
	var bounds = {};

	var ldf = OS_IOS?(Ti.Platform.displayCaps.density=="high"?2:1):Ti.Platform.displayCaps.logicalDensityFactor;

	// share the same calculation for horizontal and vertical bounds. This takes up to three points (p1, p2, and pc)
	// and span. p1 is top or left, p2 is bottom or right, pc is center, and span is height or width
	var boundsComponent = function(boundSet, direction, containerSize) {
		
		var result = {}; // result is p1, span
		var pp = -1; // placement in pixels, -1 means it isn't calculated
		var sp = -1; // size in pixels, -1 means it isn't calculated
		
		if(undefined !== boundSet.span) {
			
			result.span = boundSet.span;
			
			if(undefined !== boundSet.p1) {
				result.p1 = boundSet.p1;

			} else if(undefined !== boundSet.pc) {
				var ps = exports.calculatePixelSize(boundSet.span, direction, containerSize);
				var pc = exports.calculatePixelSize(boundSet.pc, direction, containerSize);
				pp = pc - (ph/2);
				
			} else if(undefined !== boundSet.p2) {
				var ps = exports.calculatePixelSize(boundSet.span, direction, containerSize);
				var p2 = containerSize - exports.calculatePixelSize(boundSet.p2, direction, containerSize);
				pp = p2 - ph;
				
			} else {
				// center it in view if only height is speficied
				var ps = exports.calculatePixelSize(boundSet.span, direction, containerSize);
				pp = (viewHeight-ph)/2;
				
			}
			
		} else if(undefined !== boundSet.p1) {
			
			result.p1 = boundSet.p1;
			var p1 = exports.calculatePixelSize(boundSet.p1, direction, containerSize);
			
			if(undefined !== boundSet.pc) {
				var pc = exports.calculatePixelSize(boundSet.pc, direction, containerSize);
				sp = 2*(pc - p1);
				
			} else if(undefined !== boundSet.p2) {
				sp = containerSize - exports.calculatePixelSize(boundSet.pc, direction, containerSize);
				
			} else {
				// consume all available space
				sp = containerSize - p1;
			}	
			
		} else if(undefined !== boundSet.pc) {
			
			if(undefined !== boundSet.p2) {
				var pc = exports.calculatePixelSize(boundSet.pc);
				var p2 = containerSize - exports.calculatePixelSize(boundSet.p2, direction, containerSize);
				result.span = (2*(p2-pc)).toString() + 'px';
				pp = 2*pc - pb;
				
			} else {
				// largest size that allows the center to be where it is
				var pc = exports.calculatePixelSize(boundSet.pc, direction, containerSize);
				sp = Math.min(pc, containerSize - pc);
				pp = pc - sp;
				sp *= 2;

			}
			
		} else {
			// consume all space
			pp = 0;
			sp = containerSize;

		}
		
		// now make these into proper size coords
		var convert = function(px) {
			if(px%ldf == 0) {
				return px/ldf;
			} else {
				return px.toString() + 'px';
			}
		};
		(-1 != pp) && (result.p1 = convert(pp));
		(-1 != sp) && (result.span = convert(sp));
		result.p1px = (-1 != pp) ? pp : exports.calculatePixelSize(result.p1, direction, containerSize);
		result.spanpx = (-1 != sp) ? sp : exports.calculatePixelSize(result.span, direction, containerSize);
			
		return result;
	};
	
	// copies properties from one object into another object and return the result;
	function mapProperties(dest, src, properties) {
		if(!src) return; // nothing to copy
		for(var i = 0; i < properties.length; i++) {
			var p = properties[i];
			_.has(src, p[1]) && (dest[p[0]] = src[p[1]]);
		}
		return dest;
	};
	
	var specc = _.clone(spec);
	mapProperties(specc, spec.center, [["cx","x"],["cy","y"]]);

	var bx = mapProperties({}, specc, [["p1","left"],["p2","right"],["pc","cx"],["span","width"]]);
	var by = mapProperties({}, specc, [["p1","top"],["p2","bottom"],["pc","cy"],["span","height"]]);

	mapProperties(bounds, boundsComponent(bx, "horizontal", viewSize.width),
			[["x","p1"],["width","span"],["xpx","p1px"],["widthpx","spanpx"]]);
	mapProperties(bounds, boundsComponent(by, "vertical", viewSize.height),
			[["y","p1"],["height","span"],["ypx","p1px"],["heightpx","spanpx"]]);

	DEBUG_calculatePixelSize && Ti.API.debug("util::calculatePixelSize " +
			"specc == " + JSON.stringify(specc) + " \t--> bounds == " + JSON.stringify(bounds));

	return bounds;	
};
*/

Object.defineProperties(exports, {
	ldf: {get: function() {
		return OS_IOS?(Ti.Platform.displayCaps.density=="high"?2:1):Ti.Platform.displayCaps.logicalDensityFactor;}}
});

/**
 * The maximum value in an array
 */
/*exports.max = function(ar) {
	if(ar.length === 0) {
		return; // undefined
	}
	var result = ar[0];
	for(var i = 1; i < ar.length; i++) {
		ar[i] > result && (result = ar[i]);
	}
	return result;
};
*/

/**
 * The minimum value in an array
 */
/*exports.min = function(ar) {
	if(ar.length === 0) {
		return; //undefined
	}
	var result = ar[0];
	for(var i = 1; i < ar.length; i++) {
		ar[i] < result && (result = ar[i]);
	}
	return result;
};
*/
/**
 * The sum of an array
 */
/*
exports.sum = function(ar) {
	var result = 0;
	for(var i = 0; i < ar.length; i++) {
		result += ar[i];
	}
	return result;
};
*/

/**
 * The standard deviation of an array of numbers
 * @param {Object} ar the array of numbers
 * @param {Object} mean if the mean is already known it can be provided here.
 */
/*exports.standardDeviation = function(ar, mean) {
	if(ar.length < 2) {
		return; // undefined
	}
	if(undefined === mean) {
		mean = exports.sum(ar)/ar.length;
	}
	var result = 0;
	for(var i = 0; i < ar.length; i++) {
		var _d = ar[i]-mean;
		result += Math.abs(_d*_d);
	}
	result /= ar.length - 1;
	result = Math.sqrt(result);
	return result;
};
*/

/**
 * Finds the first element in the list where the comparator returns >= 0. Assumes the items in the list are sorted so
 * the comparator(list[n+1]) >= comparator(list[n]) for all values of n where 0 <= n <= list.length-2. If there are no
 * values that return > 0, this function returns -1.
 * @param list the list to search
 * @param comparator a function to use to compare list items. It accepts the list and the index as parameters 
 * @param start the index to start the list search, default 0
 * @param end the index to end the list search, default list.length
 */
/*exports.findThreshold = function(list, comparator, start, end) {
	(undefined === start) && (start = 0);
	(undefined === end) && (end = list.length);
	if(comparator(list, end-1) < 0) {
		return -1;
	}
	if(comparator(list, start) >= 0) {
		return 0;
	}
	
	// kernel of a binary search
	var impl = function(s, e) {
		if(s === e) {
			return s;
		} else if(e-s === 1) {
			return e;
		} else {
			var m = Math.floor( (s+e) / 2 ); // m is middle
			if(comparator(list,m) >= 0) {
				return impl(s, m);
			} else {
				return impl(m, e);
			}
		}
	};
	
	return impl(start, end);
};
*/

/**
 * Subtracts one (x,y) vector from another
 */
/*exports.vMinus = function(p1, p2) {
	DEBUG_vMinus && Ti.API.debug("util::vMinus start, p1 == " + JSON.stringify(p1) + ", p2 == " + JSON.stringify(p2));
	var result = {x: p1.x - p2.x, y: p1.y - p2.y};
	DEBUG_vMinus && Ti.API.debug("util::vMinus returns " + JSON.stringify(result));
	return result;
};
*/

/**
 * Finds the closest pount to p0 within the rectangular bounds set defined by p1 and p2
 */
/*exports.closestInBounds = function(p0, p1, p2) {
	DEBUG_closestInBounds && Ti.API.debug("util.closestInBounds [p0, p1, p2] == " + JSON.stringify([p0,p1,p2]));
	var topLeft = {
		x: Math.min(p1.x, p2.x),
		y: Math.min(p1.y, p2.y)
	};
	var bottomRight = {
		x: Math.max(p1.x, p2.x),
		y: Math.max(p1.y, p2.y)
	};

	DEBUG_closestInBounds && Ti.API.debug("util.closestInBounds [p0, topLeft, bottomRight] == " + JSON.stringify([p0,topLeft,bottomRight]));
	
	var result = {
		x: Math.max(topLeft.x, Math.min(bottomRight.x, p0.x)),
		y: Math.max(topLeft.y, Math.min(bottomRight.y, p0.y))
	};

	DEBUG_closestInBounds && Ti.API.debug("util.closestInBounds result == " + JSON.stringify(result));

	return result;
};

*/


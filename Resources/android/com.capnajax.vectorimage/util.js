DEBUG_calculatePixelSize = false;

DEBUG_vMinus = false;

DEBUG_closestInBounds = false;

exports.sequence = function() {
    return __sequence++;
};

var __sequence = 1;

var dc = Ti.Platform.displayCaps;

exports.calculatePixelSize = function(spec, direction, containerSize) {
    var specUnits = "dp";
    var specValue = 0;
    if ("string" == typeof spec) {
        var unitsMatch = /^([0-9]+\.?[0-9]*)([a-z%]+)$/.exec(spec);
        if (unitsMatch && unitsMatch.length > 0) {
            specUnits = unitsMatch[2];
            specValue = unitsMatch[1];
        } else {
            specValue = new Number(spec);
            if (isNaN(specValue)) throw new Error("spec " + spec + " is not valid.");
        }
    } else if ("number" == typeof spec) {
        specUnits = "dp";
        specValue = spec;
    }
    var result = -1;
    var dpi = "horizontal" === direction ? dc.xdpi : dc.ydpi;
    switch (specUnits) {
      case "px":
        result = specValue;
        break;

      case "dip":
      case "dp":
        result = specValue * dc.logicalDensityFactor;
        break;

      case "in":
        result = specValue * dpi;
        break;

      case "mm":
        result = specValue * dpi / 25.4;
        break;

      case "cm":
        result = specValue * dpi / 2.54;
        break;

      case "pt":
        result = specValue * dpi / 72;
        break;

      case "%":
        result = specValue * containerSize / 100;
        break;

      default:
        throw new Error("spec " + spec + " has unknown units");
    }
    return Math.round(result);
};

Object.defineProperties(exports, {
    ldf: {
        get: function() {
            return Ti.Platform.displayCaps.logicalDensityFactor;
        }
    }
});
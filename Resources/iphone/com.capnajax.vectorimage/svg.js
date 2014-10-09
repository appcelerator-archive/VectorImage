function SVGImage(svgString, options) {
    var _svgTag, _svgContent1, _defsContent, _svgContent2, _header, _footer;
    var _svgAttrs, _viewBox;
    var _style = options.styleString || "";
    var _serialized;
    this.getSvgTag = function() {
        _svgTag || parseSvg();
        return _svgTag;
    };
    this.getSvgContent1 = function() {
        _svgTag || parseSvg();
        return _svgContent1;
    };
    this.getDefsContent = function() {
        _svgTag || parseSvg();
        return _defsContent;
    };
    this.getSvgContent2 = function() {
        _svgTag || parseSvg();
        return _svgContent2;
    };
    this.getHeader = function() {
        _svgTag || parseSvg();
        return _header;
    };
    this.getFooter = function() {
        _svgTag || parseSvg();
        return _footer;
    };
    this.getStyle = function() {
        return _style;
    };
    this.setStyle = function(newStyle) {
        _serialized = null;
        _style = newStyle;
    };
    var parseSvg = function() {
        var headerEndIdx, footerIndex;
        if (-1 == (headerEndIdx = svgString.indexOf("<svg")) || -1 == (footerIndex = svgString.indexOf("</svg>", headerEndIdx))) throw new Error("com.capnajax.vectorimage no <svg/> tag found, SVG not valid");
        _header = svgString.substring(0, headerEndIdx);
        _footer = svgString.substring(footerIndex);
        var svgTagEnd = svgString.indexOf(">", headerEndIdx) + 1;
        _svgTag = svgString.substring(headerEndIdx, svgTagEnd);
        _svgContent2 = svgString.substring(svgTagEnd, footerIndex);
        var defsStartIdx = svgString.indexOf("<defs"), defsTagEnd = _svgContent2.indexOf(">", defsStartIdx) + 1, defsEndIdx = svgString.indexOf("</defs>", defsStartIdx);
        if (-1 !== defsStartIdx && -1 === defsEndIdx) {
            if (!/^<defs(\s[^<>]*)?\/>/.test(_svgContent2.substring(defsStartIdx))) throw new Error("com.capnajax.vectorimage the SVG has an unclosed <defs> tag, SVG not valid");
            _svgContent1 = _svgContent2.substring(0, defsTagEnd);
            _defsContent = "";
            _svgContent2 = "</defs>" + _svgContent2.substring(defsTagEnd);
        } else if (-1 !== defsStartIdx && -1 !== defsEndIdx) {
            _defsContent = _svgContent2.substring(defsTagEnd, defsEndIdx);
            _svgContent1 = _svgContent2.substring(0, defsTagEnd);
            _svgContent2 = _svgContent2.substring(defsEndIdx);
        } else {
            _svgContent1 = "";
            _defsContent = "";
        }
    };
    var getTagAttributes = function(tag) {
        var result = {};
        var attrsStrings = tag.match(/([a-zA-Z0-9_\-\.]+(?::[a-zA-Z0-9_\-\.]+)?\s?=\s?\"[^\"]*\")/g);
        _.forEach(attrsStrings, function(item) {
            var eqIndex = item.indexOf("=");
            result[item.substring(0, eqIndex)] = item.replace(/^.*=\"(.*)\".*$/, function(m, p1) {
                return p1;
            });
        });
        return result;
    };
    this.getSvgAttrs = function() {
        _svgAttrs || (_svgAttrs = getTagAttributes(this.svgTag));
        return _svgAttrs;
    };
    this.getViewBox = function() {
        _svgTag || parseSvg();
        if (!_viewBox) {
            var attributes = this.svgAttrs;
            if (attributes.viewBox) {
                var boxVals = attributes.viewBox.split(/[ ,]/);
                if (4 != boxVals.length) throw new Error("com.capnajax.vectorimage - svg viewBox expects 4 values, only got " + boxVals.length + ", viewBox parses as " + JSON.stringify(boxVals));
                _viewBox = {
                    left: boxVals[0],
                    top: boxVals[1],
                    width: boxVals[2],
                    height: boxVals[3]
                };
            } else {
                var svgWidthAttr = attributes.width, svgHeightAttr = attributes.height;
                _viewBox = svgWidthAttr && svgWidthAttr ? {
                    left: 0,
                    top: 0,
                    width: svgWidthAttr,
                    height: svgHeightAttr
                } : null;
            }
        }
        return _viewBox;
    };
    this.applyStyle = function() {
        if (this.style && !this.svgContent1) {
            _svgContent1 = "<defs>";
            _svgContent2 = "</defs>" + _svgContent2;
            _defsContent = "";
        }
    };
    this.rebuildSvgTag = function() {
        var attrs = this.svgAttrs;
        _svgTag = "<svg";
        _.forEach(_.keys(attrs), function(key) {
            _svgTag += " " + key + '="' + attrs[key] + '"';
        });
        _svgTag += ">";
    };
    this.applyScaleFactor = function() {
        var width = options.width && calculatePixelSize(options.width, "horizontal", options.widgetWidth) / ldf;
        var height = options.height && calculatePixelSize(options.height, "vertical", options.widgetHeight) / ldf;
        width && (this.svgAttrs.width = width);
        height && (this.svgAttrs.height = height);
        this.rebuildSvgTag();
    };
    this.applyStyle();
    this.applyScaleFactor();
    this.serialize = function() {
        if (!_serialized) {
            _serialized = this.header + this.svgTag + this.svgContent1;
            this.svgContent1 && this.style && (_serialized += '<style type="text/css"><![CDATA[' + options.styleString + "]]></style>");
            _serialized += this.defsContent + this.svgContent2 + this.footer;
        }
        return _serialized;
    };
}

function calculatePixelSize(spec, direction, containerSize) {
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
    switch (specUnits) {
      case "px":
        result = specValue;
        break;

      case "dip":
      case "dp":
        result = specValue * ("high" === dc.density ? 2 : 1);
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
}

Object.defineProperties(SVGImage.prototype, {
    svgTag: {
        get: function() {
            return this.getSvgTag();
        }
    },
    svgContent1: {
        get: function() {
            return this.getSvgContent1();
        }
    },
    defsContent: {
        get: function() {
            return this.getDefsContent();
        }
    },
    svgContent2: {
        get: function() {
            return this.getSvgContent2();
        }
    },
    header: {
        get: function() {
            return this.getHeader();
        }
    },
    footer: {
        get: function() {
            return this.getFooter();
        }
    },
    svgAttrs: {
        get: function() {
            return this.getSvgAttrs();
        }
    },
    viewBox: {
        get: function() {
            return this.getViewBox();
        }
    },
    style: {
        get: function() {
            return this.getStyle();
        },
        set: function(newStyle) {
            this.setStyle(newStyle);
        }
    }
});

module.exports = SVGImage;

var dc = Ti.Platform.displayCaps, ldf = "high" == dc.density ? 2 : 1, dpi = dc.dpi;
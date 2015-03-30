
function SVGImage(svgString, options) {

	// options accepted are:
	//		styleString -- a string containing style information in CSS
	//		timeout -- feature that expunges parsed SVG document after a period of time after its most recent use.  Note
	//				that the SVGImage object is still usable after this timeout is completed, but it may have to 
	//				re-parse the document. This re-parsing is transparent. Set to 0 to disable this feature.  Default
	//				is 10000 (10 seconds)
	//		width, height, top, bottom, left, right, center -- the image's location within the view
	//		widgetWidth, widgetHeight -- the dimensions of the widget

	var _svgTag, 		// the <svg/> tag itself, avec attributes

		_svgContent1, 	// the contents of the svg element, up to the first defs tag. Empty string if there is no
						// defs tag. Note this contains the <defs> open tag.

		_defsContent,	// the contents of the first defs element, empty string if there is no defs element. If 
						// _svgContent is empty, then this is guaranteed empty.

		_svgContent2, 	// the contents of the svg document after the first defs tag. Contains the entire svg element
						// content if there is no defs tag

		_header,		// everything before the svg tag.
		_footer;		// everything from the end </svg> tag to the end fo the document

	var _svgAttrs,		// attributes of the svgTag
		_viewBox;		// the viewBox attribute, parsed

	var _style = options.styleString || ""; // the style sheet

	var _serialized;	// the svgImage, styled, and scaled, as a string.

	var clearSvg = function() {
		_svgTag = 
		_svgContent1 = 
		_defsContent =
		_svgContent2 =
		_header =
		_footer =
		_svgAttrs =
		_viewBox = 
		_serialized = null;
	};

	this.getSvgTag 		= function() { _svgTag	|| parseSvg(); 	return _svgTag;		};
	this.getSvgContent1 = function() { _svgTag	|| parseSvg(); 	return _svgContent1;};
	this.getDefsContent	= function() { _svgTag 	|| parseSvg(); 	return _defsContent;};
	this.getSvgContent2 = function() { _svgTag 	|| parseSvg(); 	return _svgContent2;};
	this.getHeader 		= function() { _svgTag	|| parseSvg(); 	return _header;		};
	this.getFooter 		= function() { _svgTag	|| parseSvg(); 	return _footer;		};

	this.getStyle 		= function() { return _style; };
	this.setStyle		= function(newStyle) { _serialized = null; _style = newStyle; };

	/**
	 *	parse the svgString into its components
	 */
	var parseSvg = function() {

		var headerEndIdx, footerIndex;

		//
		// first isolate <svg> element
		//

		if( -1 == (headerEndIdx = svgString.indexOf("<svg")) || 
			-1 == (footerIndex = svgString.indexOf("</svg>", headerEndIdx))) {
			// there is no svg tag in the document
			throw new Error("com.capnajax.vectorimage no <svg/> tag found, SVG not valid");
		}

		_header = svgString.substring(0, headerEndIdx);
		_footer = svgString.substring(footerIndex);

		var svgTagEnd = svgString.indexOf(">", headerEndIdx) + 1;

		_svgTag = svgString.substring(headerEndIdx, svgTagEnd);
		_svgContent2 = svgString.substring(svgTagEnd, footerIndex);

		var defsStartIdx = _svgContent2.indexOf("<defs"),
			defsTagEnd = _svgContent2.indexOf(">", defsStartIdx) + 1,
			defsEndIdx = _svgContent2.indexOf("</defs>", defsStartIdx);

		if(defsStartIdx !== -1 && defsEndIdx === -1) {

			// no end tag but there is a start tag. Let's check for a self-closing tag (<defs/>) before we jump 
			// to conclusions
			if(/^<defs(\s[^<>]*)?\/>/.test(_svgContent2.substring(defsStartIdx))) {
				// self-closing <defs/> tag
				_svgContent1 = _svgContent2.substring(0, defsTagEnd);
				_defsContent = "";
				_svgContent2 = "</defs>" + _svgContent2.substring(defsTagEnd);

			} else {
				// the defs tag is actually unclosed
				throw new Error("com.capnajax.vectorimage the SVG has an unclosed <defs> tag, SVG not valid");
			}

		} else if(defsStartIdx !== -1 && defsEndIdx !== -1) {
			// there is a defs tag and it contains content
			_defsContent = _svgContent2.substring(defsTagEnd, defsEndIdx);
			_svgContent1 = _svgContent2.substring(0, defsTagEnd);
			_svgContent2 = _svgContent2.substring(defsEndIdx);

		} else {
			// there is no defs tag
			_svgContent1 = "";
			_defsContent = "";

		}
	};

	var getTagAttributes = function(tag) {

		var result = {};

		var attrsStrings = tag.match(/([a-zA-Z0-9_\-\.]+(?::[a-zA-Z0-9_\-\.]+)?\s?=\s?\"[^\"]*\")/g);
		_.forEach(attrsStrings, function(item) {
			var eqIndex = item.indexOf("=");
			result[item.substring(0, eqIndex)] = item.replace(/^.*=\"(.*)\".*$/, function(m, p1) {return p1;});
		});

		return result;
	};

	this.getSvgAttrs = function() {

		if(!_svgAttrs) {
			_svgAttrs = getTagAttributes(this.svgTag);
		}

		return _svgAttrs;
	};

	/**
	 *	Gets the image's viewBox. If none is explicitely provided, derive eone from the svg width and height	
	 */
	this.getViewBox = function() {

		if(!_svgTag) {
			parseSvg();
		}

		if(!_viewBox) {

			var attributes = this.svgAttrs;

			if(attributes.viewBox) {

				// viewBox attribute provided
				var boxVals = attributes.viewBox.split(/[ ,]/);
				if(boxVals.length != 4) {
					throw new Error("com.capnajax.vectorimage - svg viewBox expects 4 values, only got " + 
							boxVals.length +", viewBox parses as " + JSON.stringify(boxVals));
				}

				_viewBox = {
					left: boxVals[0],
					top: boxVals[1],
					width: boxVals[2],
					height: boxVals[3]
				};

			} else {

				// viewBox not provided. Calculate from the image width and height
				var svgWidthAttr = attributes.width,
					svgHeightAttr = attributes.height;

				if(svgWidthAttr && svgWidthAttr) {

					_viewBox = {
						left: 0,
						top: 0,
						width: svgWidthAttr,
						height: svgHeightAttr
					};

				} else {

					// image's width and height are not provided.
					_viewBox = null;

				}
			}
		}

		return _viewBox;
	};

	/**
	 *	Adds the given stylesheet to the image
	 */
	this.applyStyle = function() {

		if(this.style) {
	
			if(!this.svgContent1) {
				_svgContent1 = "<defs>";
				_svgContent2 = "</defs>" + _svgContent2;
				_defsContent = "";
			}
		}
	};

	/*
	 *	Builds a new svgTag from the attributes
	 */
	this.rebuildSvgTag = function() {
		var attrs = this.svgAttrs;
		_svgTag = "<svg";
		_.forEach(_.keys(attrs), function(key) {
			_svgTag += " " + key + "=\"" + attrs[key] + "\"";
		});
		_svgTag += ">";
	};

	/*
	 *	Sets the scaleFactor of the image
	 */
	this.applyScaleFactor = function() {

		var width = options.width && calculatePixelSize(options.width, "horizontal", options.widgetWidth)/ldf;
		var height = options.height && calculatePixelSize(options.height, "vertical", options.widgetHeight)/ldf;

		width && (this.svgAttrs.width = width);
		height && (this.svgAttrs.height = height);

		this.rebuildSvgTag();
	};

	this.applyStyle();
	this.applyScaleFactor();

	this.serialize = function() {

		if(!_serialized) {

			_serialized = this.header + this.svgTag + this.svgContent1;
			if(this.svgContent1 && this.style) {
				_serialized += '<style type="text/css"><![CDATA[' + options.styleString + ']]></style>';
			}
			_serialized += this.defsContent + this.svgContent2 + this.footer;

		}

		return _serialized;
	};

}
Object.defineProperties(SVGImage.prototype, {
	'svgTag'		: { get: function() { return this.getSvgTag(); 		}},
	'svgContent1'	: { get: function() { return this.getSvgContent1(); }}, 
	'defsContent'	: { get: function() { return this.getDefsContent(); }}, 
	'svgContent2'	: { get: function() { return this.getSvgContent2(); }}, 
	'header'		: { get: function() { return this.getHeader();		}}, 
	'footer'		: { get: function() { return this.getFooter();		}}, 
	'svgAttrs'		: { get: function() { return this.getSvgAttrs();	}}, 
	'viewBox'		: { get: function() { return this.getViewBox(); 	}},
	'style'			: { get: function() { return this.getStyle();		},	
						set: function(newStyle) { this.setStyle(newStyle); }}
});

module.exports = SVGImage;

//
//	Below this point are some helper functions
//

var dc = Ti.Platform.displayCaps,
	ldf = ("high" == dc.density) ? 2 : 1,
	dpi = dc.dpi;

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


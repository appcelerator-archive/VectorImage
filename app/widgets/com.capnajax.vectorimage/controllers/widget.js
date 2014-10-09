
var args = arguments[0] || {};

// create a cache directory if it hasn't been created already
Alloy.Globals["com.capnajax.vectorimage"] || (Alloy.Globals["com.capnajax.vectorimage"] = {});
var v = Alloy.Globals["com.capnajax.vectorimage"];
(function() {
	
	v.willCache = false;
	
	if(!v.cacheDirCreated) {

		v.cacheDirCreated = true;

		var createDir = function(path) {
	
			var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, path);
			if(!dir.exists()) {
				if(!dir.createDirectory()) {
					Ti.API.warn("com.capnajax.vectorimage cannot create image cache directory. Cache feature disabled");
					return false;
				}
			}
			return true;
		};

		if( ! (createDir("com.capnajax.vectorimage") && createDir("com.capnajax.vectorimage/imagecache"))) {
			return;
		}

		v.willCache = true;
	}
		
})();

function init(obj) {
	$.widget.applyProperties(_.omit(obj, ["svg", "style"]));
	
	var width = obj.width,
		height = obj.height;
	
	draw(obj.svg, obj.style, width, height, obj.backgroundColor);
}

function cacheFile(svgString, styleString, width, height, backgroundColor) {

	var nameComponents = [];

	// svg and style
	nameComponents.push(Ti.Utils.md5HexDigest(svgString));
	nameComponents.push((styleString && Ti.Utils.md5HexDigest(styleString)) || "no-style");
	
	// size
	if(width && height) {
		nameComponents.push(width.toString() + "x" + height.toString());
	} else if(width) {
		nameComponents.push(width.toString() + "w");
	} else if(height) {
		nameComponents.push(height.toString() + "h");
	} else {
		nameComponents.push("no-size");
	}

	// backgroundColor
	nameComponents.push(backgroundColor || "no-bg");
	
	var filename = "com.capnajax.vectorimage/imagecache/" + nameComponents.join(",");
	result = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, filename);
	
	return result;
}


/**
 *	Normalizes a source, that can be expressed as filename, raw text, or a Ti.Filesystem.File, return the raw
 *  svg source.  If source is a String, this method will use heuristics to determine if the string is a raw source
 *	or a filename.
 *	@param source {Ti.Filesystem.File|String} the source image.
 */
function sourceText(source) {
	var result;
	if(_.isObject(source)) {
		if(source.apiName == Ti.Filesystem.File) {
			// read the file and return it
			result = source.read().text;
		} else {
			throw new Error("com.capnajax.vectorimage::widget::sourceText invalid object, apiName " + source.apiName);
		}
	} else if(_.isString(source)) {
		if(/[\<\{]/.test(source)) { // TODO style sheets won't start with a <
			// this is the raw source
			result = source;
		} else {
			// this is probably a filename
			var path = source;
			if(!(/^\//.test(source))) {
				source = Ti.Filesystem.resourcesDirectory + '/' + source;
			}
			result = Ti.Filesystem.getFile(source).read().text;
		}
		
	} else {
		throw new Error("com.capnajax.vectorimage::widget::sourceText invalid param of type " + (typeof source));
	}

	return result;
}

function draw(svg, style, width, height, backgroundColor, callback) {
	
	// get the text of the svg and style
	var svgString = svg && sourceText(svg);
	var styleString = style && sourceText(style);			
	
	// TODO test if the svg is already in the database
	//var svgmd5 = svgString && Ti.Utils.md5HexDigest(svgString);
	//var stylemd5 = styleString && Ti.Utils.md5HexDigest(styleString);
	// use these md5sums to check if the svg exists in the db

	$.widget.removeAllChildren();

	if(v.willCache) {
		var file = cacheFile(svgString, styleString, width, height, backgroundColor);
		if(file.exists()) {
			Ti.API.info("com.capnajax.vectorimage drawing image from cache");			
			var imageView = Ti.UI.createImageView({
				width: width,
				height: height,
				hires: true,
				image: file
			});
			_.defer(function() {$.widget.add(imageView);});
			
		} else {
			Ti.API.info("com.capnajax.vectorimage drawing image from svg");
			drawWebView(svgString, styleString, width, height, backgroundColor, function(imageBlob) {
				if(imageBlob) {
					file.write(imageBlob);
				}
				callback && callback(imageBlob);
			});
		}		
	} else {
		drawWebView(svgString, styleString, width, height, backgroundColor, callback);
	}
}

function drawWebView(svg, style, width, height, backgroundColor, callback) {
	if(width || height) {
		drawWebViewImpl(svg, style, width, height, backgroundColor, callback);
	} else if($.widget.rect.width || $.widget.rect.height) {
		drawWebViewImpl(svg, style, $.widget.rect.width, $.widget.rect.height, backgroundColor, callback);
	} else {
		var postlayout = function() {
			$.widget.removeEventListener('postlayout', postlayout);
			drawWebViewImpl(svg, style, $.widget.rect.width, $.widget.rect.height, backgroundColor, callback);
		};
		$.widget.addEventListener('postlayout', postlayout);
	}
}

function drawWebViewImpl(svg, style, width, height, backgroundColor, callback) {
	var html = svg,
		wvWidth  = width || $.widget.rect.width,
		wvHeight = height || $.widget.rect.height;
	
	var SVGImage = require(WPATH('svg'));

	var svgImage = new SVGImage(svg, {
		styleString: style,
		width: wvWidth,
		height: wvHeight
	});

	var view = Ti.UI.createWebView({
		top: 0,
		left: 0,
		width: wvWidth,
		height: wvHeight,
		backgroundColor: backgroundColor || 'transparent',
		showScrollbars: false,
		disableBounce: true,
		enableZoomControls: false,
		overScrollMode: OS_ANDROID ? Ti.UI.Android.OVER_SCROLL_NEVER : null,
	});

	_.defer(function() {

		var svgSource = svgImage.serialize();
		
		// webview puts a margin around svg images. let's suppress that by embedding it in html.
		// the meta tag is there to suppress scrollbars and to ensure the correct scale over different densities
		view.html = '<html><head><title></title>' + 
				'<meta name="viewport" content="user-scalable=no,initial-scale=1" /></head>' +
				'<body style="margin:0;padding:0">' + svgSource + '</body></html>';

		$.widget.add(view);

		setTimeout(function() {
			if(OS_ANDROID) {
//				callback($.widget.toImage());
			} else {
//				callback($.widget.toImage(true));
			}
		}, 1000);
	
	});
}


init(args);
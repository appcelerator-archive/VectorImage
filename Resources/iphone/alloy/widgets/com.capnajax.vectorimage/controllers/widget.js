function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "com.capnajax.vectorimage/" + s : s.substring(0, index) + "/com.capnajax.vectorimage/" + s.substring(index + 1);
    return path;
}

function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function init(obj) {
        $.widget.applyProperties(_.omit(obj, [ "svg", "style" ]));
        var width = obj.width, height = obj.height;
        draw(obj.svg, obj.style, width, height, obj.backgroundColor);
    }
    function cacheFile(svgString, styleString, width, height, backgroundColor) {
        var nameComponents = [];
        nameComponents.push(Ti.Utils.md5HexDigest(svgString));
        nameComponents.push(styleString && Ti.Utils.md5HexDigest(styleString) || "no-style");
        nameComponents.push(width && height ? width.toString() + "x" + height.toString() : width ? width.toString() + "w" : height ? height.toString() + "h" : "no-size");
        nameComponents.push(backgroundColor || "no-bg");
        var filename = "com.capnajax.vectorimage/imagecache/" + nameComponents.join(",");
        result = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, filename);
        return result;
    }
    function sourceText(source) {
        var result;
        if (_.isObject(source)) {
            if (source.apiName != Ti.Filesystem.File) throw new Error("com.capnajax.vectorimage::widget::sourceText invalid object, apiName " + source.apiName);
            result = source.read().text;
        } else {
            if (!_.isString(source)) throw new Error("com.capnajax.vectorimage::widget::sourceText invalid param of type " + typeof source);
            if (/[\<\{]/.test(source)) result = source; else {
                /^\//.test(source) || (source = Ti.Filesystem.resourcesDirectory + "/" + source);
                result = Ti.Filesystem.getFile(source).read().text;
            }
        }
        return result;
    }
    function draw(svg, style, width, height, backgroundColor, callback) {
        var svgString = svg && sourceText(svg);
        var styleString = style && sourceText(style);
        $.widget.removeAllChildren();
        if (v.willCache) {
            var file = cacheFile(svgString, styleString, width, height, backgroundColor);
            if (file.exists()) {
                Ti.API.info("com.capnajax.vectorimage drawing image from cache");
                var imageView = Ti.UI.createImageView({
                    width: width,
                    height: height,
                    hires: true,
                    image: file
                });
                _.defer(function() {
                    $.widget.add(imageView);
                });
            } else {
                Ti.API.info("com.capnajax.vectorimage drawing image from svg");
                drawWebView(svgString, styleString, width, height, backgroundColor, function(imageBlob) {
                    imageBlob && file.write(imageBlob);
                    callback && callback(imageBlob);
                });
            }
        } else drawWebView(svgString, styleString, width, height, backgroundColor, callback);
    }
    function drawWebView(svg, style, width, height, backgroundColor, callback) {
        if (width || height) drawWebViewImpl(svg, style, width, height, backgroundColor, callback); else if ($.widget.rect.width || $.widget.rect.height) drawWebViewImpl(svg, style, $.widget.rect.width, $.widget.rect.height, backgroundColor, callback); else {
            var postlayout = function() {
                $.widget.removeEventListener("postlayout", postlayout);
                drawWebViewImpl(svg, style, $.widget.rect.width, $.widget.rect.height, backgroundColor, callback);
            };
            $.widget.addEventListener("postlayout", postlayout);
        }
    }
    function drawWebViewImpl(svg, style, width, height, backgroundColor) {
        var wvWidth = width || $.widget.rect.width, wvHeight = height || $.widget.rect.height;
        var SVGImage = require(WPATH("svg"));
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
            backgroundColor: backgroundColor || "transparent",
            showScrollbars: false,
            disableBounce: true,
            enableZoomControls: false,
            overScrollMode: null
        });
        _.defer(function() {
            var svgSource = svgImage.serialize();
            view.html = '<html><head><title></title><meta name="viewport" content="user-scalable=no,initial-scale=1" /></head><body style="margin:0;padding:0">' + svgSource + "</body></html>";
            $.widget.add(view);
            setTimeout(function() {}, 1e3);
        });
    }
    new (require("alloy/widget"))("com.capnajax.vectorimage");
    this.__widgetId = "com.capnajax.vectorimage";
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "widget";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.widget = Ti.UI.createView({
        id: "widget"
    });
    $.__views.widget && $.addTopLevelView($.__views.widget);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var args = arguments[0] || {};
    Alloy.Globals["com.capnajax.vectorimage"] || (Alloy.Globals["com.capnajax.vectorimage"] = {});
    var v = Alloy.Globals["com.capnajax.vectorimage"];
    !function() {
        v.willCache = false;
        if (!v.cacheDirCreated) {
            v.cacheDirCreated = true;
            var createDir = function(path) {
                var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, path);
                if (!dir.exists() && !dir.createDirectory()) {
                    Ti.API.warn("com.capnajax.vectorimage cannot create image cache directory. Cache feature disabled");
                    return false;
                }
                return true;
            };
            if (!(createDir("com.capnajax.vectorimage") && createDir("com.capnajax.vectorimage/imagecache"))) return;
            v.willCache = true;
        }
    }();
    init(args);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
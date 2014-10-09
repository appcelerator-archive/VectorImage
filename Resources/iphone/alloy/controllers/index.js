function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    $.__views.index = Ti.UI.createWindow({
        backgroundColor: "white",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    var __alloyId0 = [];
    $.__views.stylesheets = Ti.UI.createView({
        id: "stylesheets"
    });
    __alloyId0.push($.__views.stylesheets);
    $.__views.__alloyId1 = Ti.UI.createLabel({
        top: 20,
        height: 30,
        text: "Style Sheets",
        id: "__alloyId1"
    });
    $.__views.stylesheets.add($.__views.__alloyId1);
    $.__views.__alloyId2 = Ti.UI.createView({
        top: 50,
        left: 0,
        right: 0,
        bottom: 0,
        layout: "vertical",
        id: "__alloyId2"
    });
    $.__views.stylesheets.add($.__views.__alloyId2);
    $.__views.stop = Ti.UI.createView({
        height: "40%",
        id: "stop"
    });
    $.__views.__alloyId2.add($.__views.stop);
    $.__views.__alloyId3 = Alloy.createWidget("com.capnajax.vectorimage", "widget", {
        top: 0,
        left: 0,
        right: 0,
        bottom: 20,
        svg: "svg/light.svg",
        style: "svg/stop.css",
        id: "__alloyId3",
        __parentSymbol: $.__views.stop
    });
    $.__views.__alloyId3.setParent($.__views.stop);
    $.__views.caution = Ti.UI.createView({
        height: "30%",
        id: "caution"
    });
    $.__views.__alloyId2.add($.__views.caution);
    $.__views.__alloyId4 = Alloy.createWidget("com.capnajax.vectorimage", "widget", {
        top: 0,
        left: 0,
        right: 0,
        bottom: 20,
        svg: "svg/light.svg",
        style: "svg/caution.css",
        id: "__alloyId4",
        __parentSymbol: $.__views.caution
    });
    $.__views.__alloyId4.setParent($.__views.caution);
    $.__views.go = Ti.UI.createView({
        height: "30%",
        id: "go"
    });
    $.__views.__alloyId2.add($.__views.go);
    $.__views.__alloyId5 = Alloy.createWidget("com.capnajax.vectorimage", "widget", {
        top: 0,
        left: 0,
        right: 0,
        bottom: 20,
        svg: "svg/light.svg",
        style: "svg/go.css",
        id: "__alloyId5",
        __parentSymbol: $.__views.go
    });
    $.__views.__alloyId5.setParent($.__views.go);
    $.__views.tiger = Ti.UI.createView({
        top: 20,
        left: 20,
        right: 20,
        bottom: 20,
        backgroundColor: "white",
        id: "tiger"
    });
    __alloyId0.push($.__views.tiger);
    $.__views.__alloyId6 = Ti.UI.createLabel({
        top: 20,
        height: 30,
        text: "Tiger",
        id: "__alloyId6"
    });
    $.__views.tiger.add($.__views.__alloyId6);
    $.__views.__alloyId7 = Ti.UI.createView({
        top: 50,
        left: 0,
        right: 0,
        bottom: 0,
        layout: "vertical",
        id: "__alloyId7"
    });
    $.__views.tiger.add($.__views.__alloyId7);
    $.__views.__alloyId8 = Alloy.createWidget("com.capnajax.vectorimage", "widget", {
        svg: "svg/awesome_tiger.svg",
        id: "__alloyId8",
        __parentSymbol: $.__views.__alloyId7
    });
    $.__views.__alloyId8.setParent($.__views.__alloyId7);
    $.__views.scrollable = Ti.UI.createScrollableView({
        showPagingControl: true,
        views: __alloyId0,
        id: "scrollable"
    });
    $.__views.index.add($.__views.scrollable);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.index.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
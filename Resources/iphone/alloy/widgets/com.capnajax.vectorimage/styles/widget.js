function WPATH(s) {
    var index = s.lastIndexOf("/");
    var path = -1 === index ? "com.capnajax.vectorimage/" + s : s.substring(0, index) + "/com.capnajax.vectorimage/" + s.substring(index + 1);
    return path;
}

module.exports = [];
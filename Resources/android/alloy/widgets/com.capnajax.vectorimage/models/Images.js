var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

exports.definition = {
    config: {
        columns: {
            svg: "string",
            style: "string",
            widthpx: "int",
            heightpx: "int",
            png: "string"
        },
        adapter: {
            type: "sql",
            collection_name: "images"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {});
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {});
        return Collection;
    }
};

model = Alloy.M("images", exports.definition, []);

collection = Alloy.C("images", exports.definition, model);

exports.Model = model;

exports.Collection = collection;
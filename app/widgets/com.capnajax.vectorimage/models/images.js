exports.definition = {
	config: {
		columns: {
		    "svg": "string",
		    "style": "string",
		    "widthpx": "int",
		    "heightpx": "int",
		    "png": "string"
		},
		adapter: {
			type: "sql",
			collection_name: "images"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});

		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});

		return Collection;
	}
};
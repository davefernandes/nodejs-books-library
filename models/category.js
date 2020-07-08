var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var CategorySchema = new Schema({
    name: {type: String, required: true, min: 3, max: 50}
});

/*
* Setup a Virtual Getter to retrieve the url directly.
*/
CategorySchema.virtual('url').get(function () {
    return '/category/'+this._id;
});

/*
* Export the Category Model
*/
module.exports = mongoose.model('Category', CategorySchema);

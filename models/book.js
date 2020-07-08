var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var BookSchema = new Schema({
    title: {type: String, required: true},
    date_created: {type: Date, default: Date.now},
    author: { type: Schema.ObjectId, ref: 'Author', required: true },
    summary: {type: String, required: true, max: 150},
    isbn: {type: String, required: true},
    book_image: {type: String},
    category: [{ type: Schema.ObjectId, ref: 'Category' }]
});

/*
* Setup a Virtual Getter to retrieve the url directly.
*/
BookSchema.virtual('url').get(function () {
    return '/book/'+this._id;
});

/*
* Export the Book Model
*/
module.exports = mongoose.model('Book', BookSchema);

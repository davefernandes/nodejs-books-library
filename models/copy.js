var mongoose    = require('mongoose');
var moment      = require('moment');

var Schema = mongoose.Schema;

var CopySchema = new Schema({
    book: { type: Schema.ObjectId, ref: 'Book', required: true }, // Reference to the actual book.
    created_date: {type: Date, default: Date.now},
    reference: {type: String, required: true},
    status: {type: String, required: true, enum:['Available', 'Loaned', 'Reserved', 'Retired'], default:'Available'},
    due_back: { type: Date, default: Date.now }
});

/*
* Setup a Virtual Getter to retrieve the due back formatted date.
*/
CopySchema.virtual('due_back_yyyy_mm_dd').get(function () {
  return moment(this.due_back).format('YYYY-MM-DD');
});

/*
* Setup a Virtual Getter to retrieve the url directly.
*/
CopySchema.virtual('url').get(function () {
  return '/copy/'+this._id;
});

/*
* Export the Copy Model
*/
module.exports = mongoose.model('Copy', CopySchema);

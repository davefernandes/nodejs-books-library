var mongoose    = require('mongoose');
var moment      = require('moment'); // This package helps for date handling.
var Schema      = mongoose.Schema;

var AuthorSchema = new Schema({
    first_name: { type: String, required: true, max: 100 },
    family_name: { type: String, required: true, max: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date }
});

/*
* Setup a Virtual Getter to retrieve the url directly.
*/
AuthorSchema.virtual('url').get(function() {
    return '/author/' + this._id;
});

/*
* Setup a Virtual Getter to retrieve the full name directly.
*/
AuthorSchema.virtual('fullname').get(function() {
    var fullname = '';

    if (this.first_name && this.family_name) {
        fullname = this.family_name + ', ' + this.first_name;
    }

    if (!this.first_name && !this.family_name) {
        fullname = '';
    }
    return fullname;
});


/*
* Setup a Virtual Getter to retrieve the lifespan directly.
*/
AuthorSchema.virtual('lifespan').get(function() {
    var lifetime_string = '';
    if (this.date_of_birth) {
        lifetime_string = moment(this.date_of_birth).format('MMMM Do, YYYY');
    }
    lifetime_string += ' - ';
    if (this.date_of_death) {
        lifetime_string += moment(this.date_of_death).format('MMMM Do, YYYY');
    }
    return lifetime_string;
});


/*
* Setup a Virtual Getter to retrieve the DOB formatted directly.
*/
AuthorSchema.virtual('date_of_birth_yyyy_mm_dd').get(function() {
    return moment(this.date_of_birth).format('YYYY-MM-DD');
});


/*
* Setup a Virtual Getter to retrieve the DOD formatted directly.
*/
AuthorSchema.virtual('date_of_death_yyyy_mm_dd').get(function() {
    return moment(this.date_of_death).format('YYYY-MM-DD');
});


/*
* Export the Author Model
*/
module.exports = mongoose.model('Author', AuthorSchema);
var async       = require('async');

var Copy    = require('../models/copy');
var Book    = require('../models/book');

const { body, validationResult } = require('express-validator');

/*
* Get all the copies
*/
exports.copy_list = function(req, res) {

    Copy.find()
    .sort([['created_date', 'descending']])
    .populate('book')
    .exec(function(err, results) {
        if(err) { return next(err); }
        res.render('copy_list', { title: 'Copy List', copy_list: results });
    })
    
};


// Display detail page for a specific Copy.
exports.copy_detail = function(req, res, next) {

    Copy.findById(req.params.id)
    .populate('book')
    .exec(function (err, copy) {
      if (err) { return next(err); }
      if (copy==null) { // No results.
          var err = new Error('Copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('copy_detail', { title: 'Copy Detail', copy:  copy});
    })

};



// Display Copy create form on GET.
exports.copy_create_get = function(req, res, next) {

    Book.find({},'title')
   .exec(function (err, books) {
     if (err) { return next(err); }
     // Successful, so render.
     res.render('copy_form', {title: 'Create Copy', action_type: 'Create', book_list:books } );
   });

};


// Handle Copy create on POST.
exports.copy_create_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim().escape(),
    body('reference', 'Reference must be specified').isLength({ min: 1 }).trim().escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('status').escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Copy object with escaped and trimmed data.
        var copy = new Copy(
          { book: req.body.book,
            reference: req.body.reference,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('copy_form', { title: 'Create Copy', action_type: 'Create', book_list : books, selected_book : copy.book._id , errors: errors.array(), copy:copy });
            });
            return;
        }
        else {
            // Data from form is valid
            copy.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new record.
                res.redirect(copy.url);
            });
        }
    }
];


// Display Copy update form on GET.
exports.copy_update_get = function(req, res, next) {

    // Get book, authors and categories for form.
    async.parallel({
        copy: function(callback) {
            Copy.findById(req.params.id).populate('book').exec(callback)
        },
        books: function(callback) {
            Book.find(callback)
        },

        }, function(err, results) {
            if (err) { return next(err); }
            if (results.copy==null) { // No results.
                var err = new Error('Copy not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('copy_form', { title: 'Update Copy', action_type: 'Update', book_list : results.books, selected_book : results.copy.book._id, copy:results.copy });
        });

};

// Handle Copy update on POST.
exports.copy_update_post = [

    // Validate fields.
    body('book', 'Book must be specified').isLength({ min: 1 }).trim().escape(),
    body('reference', 'Reference must be specified').isLength({ min: 1 }).trim().escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),
    body('status').escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Copy object with escaped/trimmed data and current id.
        var copy = new Copy(
          { book: req.body.book,
            reference: req.body.reference,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id
           });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('copy_form', { title: 'Update Copy', book_list : books, selected_book : copy.book._id , errors: errors.array(), copy:copy });
            });
            return;
        }
        else {
            // Data from form is valid.
            Copy.findByIdAndUpdate(req.params.id, copy, {}, function (err,thecopy) {
                if (err) { return next(err); }
                // Successful - redirect to detail page.
                res.redirect(thecopy.url);
            });
        }
    }
];


// Display Copy delete form on GET.
exports.copy_delete_get = function(req, res, next) {

    Copy.findById(req.params.id)
    .populate('book')
    .exec(function (err, copy) {
        if (err) { return next(err); }
        if (copy==null) { // No results.
            res.redirect('/copy');
        }
        // Successful, so render.
        res.render('copy_delete', { title: 'Delete Copy', copy:  copy});
    })

};

// Handle Copy delete on POST.
exports.copy_delete_post = function(req, res, next) {
    
    // Assume valid Copy id in field.
        Copy.findByIdAndRemove(req.body.id, function deleteCopy(err) {
        if (err) { return next(err); }
            // Success, so redirect to list of Copy items.
            res.redirect('/copy');
        });

};
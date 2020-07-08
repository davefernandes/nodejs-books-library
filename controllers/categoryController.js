var async       = require('async');
var Entities    = require('html-entities').AllHtmlEntities;
var entities    = new Entities();

var Category    = require('../models/category');
var Book        = require('../models/book');

const { body, validationResult } = require('express-validator');


/*
* Get all the categories
*/
exports.category_list = function(req, res) {

    Category.find()
    .sort([['name', 'ascending']])
    .exec(function(err, results) {
        if(err) { return next(err); }
        res.render('category_list', { title: 'Category List', category_list: results });
    })

};


/*
* Get Category Data
*/
exports.category_detail = function (req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id)
              .exec(callback);
        },

        category_books: function(callback) {
          Book.find({ 'category': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }

        // A fix to Unescape certain HTML characters
        results.category_books.forEach(function (bookObj){
            bookObj.summary = entities.decode(bookObj.summary);
        });

        // Successful, so render.
        res.render('category_detail', { title: 'Category Detail', category: results.category, category_books: results.category_books } );
    });

};


// Display Category create form on GET.
exports.category_create_get = function(req, res, next) {
    res.render('category_form', { title: 'Create Category', action_type: 'Create'});
};


// Handle Category create on POST.
exports.category_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Category name required').isLength({ min: 1 }).trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a category object with escaped and trimmed data.
        var category = new Category(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('category_form', { title: 'Create Category', action_type: 'Create', category: category, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Category with same name already exists.
            Category.findOne({ 'name': req.body.name })
                .exec( function(err, found_category) {
                     if (err) { return next(err); }

                     if (found_category) {
                         // Category exists, redirect to its detail page.
                         res.redirect(found_category.url);
                     }
                     else {

                        category.save(function (err) {
                           if (err) { return next(err); }
                           // Category saved. Redirect to category detail page.
                           res.redirect(category.url);
                         });

                     }

                 });
        }
    }
];


// Display Category update form on GET.
exports.category_update_get = function(req, res, next) {

    Category.findById(req.params.id, function(err, category) {
        if (err) { return next(err); }
        if (category==null) { // No results.
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('category_form', { title: 'Update Category', action_type: 'Update', category: category });
    });

};


// Handle Category update on POST.
exports.category_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'Category name required').isLength({ min: 1 }).trim().escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a category object with escaped and trimmed data (and the old id!)
        var category = new Category(
          {
          name: req.body.name,
          _id: req.params.id
          }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('category_form', { title: 'Update Category', action_type: 'Update', category: category, errors: errors.array()});
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Category.findByIdAndUpdate(req.params.id, category, {}, function (err,thecategory) {
                if (err) { return next(err); }
                   // Successful - redirect to category detail page.
                   res.redirect(thecategory.url);
                });
        }
    }
];


// Display Category delete form on GET.
exports.category_delete_get = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback);
        },
        category_books: function(callback) {
            Book.find({ 'category': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.category==null) { // No results.
            res.redirect('/category');
        }
        // Successful, so render.
        res.render('category_delete', { title: 'Delete Category', category: results.category, category_books: results.category_books } );
    });

};

// Handle Category delete on POST.
exports.category_delete_post = function(req, res, next) {

    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback);
        },
        category_books: function(callback) {
            Book.find({ 'category': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.category_books.length > 0) {
            // Category has books. Render in same way as for GET route.
            res.render('category_delete', { title: 'Delete Category', category: results.category, category_books: results.category_books } );
            return;
        }
        else {
            // Category has no books. Delete object and redirect to the list of categories.
            Category.findByIdAndRemove(req.body.id, function deleteCategory(err) {
                if (err) { return next(err); }
                // Success - go to categories list.
                res.redirect('/category');
            });

        }
    });

};
var async       = require('async');
var multer      = require('multer');
var crypto      = require('crypto');
var path        = require('path');
var fs          = require('fs');
var Entities    = require('html-entities').AllHtmlEntities;
var entities    = new Entities();

var Author      = require('../models/author');
var Book        = require('../models/book');
var Category    = require('../models/category');
var Copy        = require('../models/copy');

const { body, validationResult } = require('express-validator');

const storage = multer.diskStorage({
    destination: './public/book_images/',
    filename: function(req,file,cb) {
        const newDate       = new Date();
        const timestamp     = newDate.getTime().toString();
        const newFileName   = crypto.createHash('md5').update(timestamp).digest("hex");
        cb(null,newFileName + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage
});


/*
* Get all the books
*/
exports.book_list = function(req, res) {

    Book.find()
    .sort([['created_date', 'descending']])
    .populate('author')
    .populate('category')
    .exec(function(err, results) {
        if(err) { return next(err); }
        res.render('book_list', { title: 'Book List', book_list: results });
    })
    
};


/*
* Get Book Data
*/
exports.book_detail = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
              .populate('author')
              .populate('category')
              .exec(callback);
        },
        book_copies: function(callback) {
            Copy.find({ 'book': req.params.id })
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }

        // A fix to Unescape certain HTML characters
        results.book.summary = entities.decode(results.book.summary);

        // Check if image exists
        const cover_exists = results.book.book_image && fs.existsSync(process.cwd()+'/public/book_images/'+results.book.book_image) ? true : false;
        // Successful, so render.
        res.render('book_detail', { title: 'Book Details', book:  results.book, book_copies: results.book_copies, cover_exists: cover_exists  } );
    });

};


/*
* Book Create Form
*/
exports.book_create_get = function (req, res, next) {
    // Get all authors and categories, which we can use for adding to our book.
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', action_type: 'Create', authors:results.authors, categories:results.categories });
    });
};

/*
* Book Create Post
*/

exports.book_create_post = [

    upload.single('book_image'),

    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category==='undefined')
            req.body.category=[];
            else
            req.body.category=new Array(req.body.category);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim().escape(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim().escape(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim().escape(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim().escape(),
    body('category.*').escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);
        
        // Create Book object with escaped and trimmed data
        var book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                category: req.body.category
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            
            //If errors then delete the image if uploaded
            if(req.file) {
                fs.unlink(process.cwd()+'/public/book_images/'+req.file.filename, (err) => {
                    if (err) { return next(err); }
                });  
            } 

            // Get all authors and categories for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (book.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Create Book', action_type: 'Create', authors:results.authors, categories:results.categories, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid.

            if( req.file ) {
                book.book_image = req.file.filename;
            }

            // Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new book record.
                res.redirect(book.url);
            });
        }
    }
];



// Display book update form on GET.
exports.book_update_get = function(req, res, next) {

    // Get book, authors and categories for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('category').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        categories: function(callback) {
            Category.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book==null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected categories as checked.
            for (var i = 0; i < results.categories.length; i++) {
                for (var j = 0; j < results.book.category.length; j++) {
                    if (results.categories[i]._id.toString()==results.book.category[j]._id.toString()) {
                        results.categories[i].checked='true';
                    }
                }
            }
            // Check if image exists
            const cover_exists = results.book.book_image && fs.existsSync(process.cwd()+'/public/book_images/'+results.book.book_image) ? true : false;
            // Successful, so render.
            res.render('book_form', { title: 'Update Book', action_type: 'Update', authors:results.authors, categories:results.categories, book: results.book, cover_exists: cover_exists });
        });

};


// Handle book update on POST.
exports.book_update_post = [

    upload.single('book_image'),

    // Convert the category to an array.
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category==='undefined')
            req.body.category=[];
            else
            req.body.category=new Array(req.body.category);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 2 }).trim().escape(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim().escape(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim().escape(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim().escape(),
    body('category.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            category: (typeof req.body.category==='undefined') ? [] : req.body.category,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            
            //If errors then delete the image if uploaded
            if(req.file) {
                fs.unlink(process.cwd()+'/public/book_images/'+req.file.filename, (err) => {
                    if (err) { return next(err); }
                });  
            } 

            // Get all authors and categories for form
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                categories: function(callback) {
                    Category.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected categories as checked.
                for (let i = 0; i < results.categories.length; i++) {
                    if (book.category.indexOf(results.categories[i]._id) > -1) {
                        results.categories[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book', action_type: 'Update', authors:results.authors, categories:results.categories, book: book, errors: errors.array() });
            });
            return;
        }
        else {

            if( req.file ) {
                book.book_image = req.file.filename;
            }
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page
                res.redirect(thebook.url);
            });
        }
    }    

];


// Delete book image on GET.
exports.book_deleteimage_get = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            res.redirect('/book');
        }

        if( results.book.book_image && fs.existsSync(process.cwd()+'/public/book_images/'+results.book.book_image) ) {
            fs.unlink(process.cwd()+'/public/book_images/'+results.book.book_image, (err) => {
                if (err) { return next(err); }
                
                Book.findByIdAndUpdate(req.params.id, { $set: { book_image: '' }}, {}, function (err,thebook) {
                    if (err) { return next(err); }
                    // Successful - redirect to book detail page
                    res.redirect(thebook.url);
                });


            });          
        } else {
            res.redirect('/book');
        }

    });

};


// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('category').exec(callback);
        },
        book_copies: function(callback) {
            Copy.find({ 'book': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            res.redirect('/book');
        }
        // Successful, so render.
        res.render('book_delete', { title: 'Delete Book', book: results.book, book_copies: results.book_copies } );
    });

};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        book: function(callback) {
            Book.findById(req.body.id).populate('author').populate('category').exec(callback);
        },
        book_copies: function(callback) {
            Copy.find({ 'book': req.body.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.book_copies.length > 0) {
            // Book has copies. Render in same way as for GET route.
            res.render('book_delete', { title: 'Delete Book', book: results.book, book_copies: results.book_copies } );
            return;
        }
        else {
            // Book has no Copy objects. Delete object and redirect to the list of books.
            Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
                if (err) { return next(err); }
                // Success - got to books list.
                res.redirect('/book');
            });

        }
    });

};
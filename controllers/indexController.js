var async       = require('async');
var Entities    = require('html-entities').AllHtmlEntities;
var entities    = new Entities();

var Book        = require('../models/book');
var Author      = require('../models/author');
var Category    = require('../models/category');
var Copy        = require('../models/copy');


exports.index = function(req, res) {

    async.parallel({
        book_count: function(callback) {
            Book.estimatedDocumentCount(callback);
        },
        author_count: function(callback) {
            Author.estimatedDocumentCount(callback);
        },
        category_count: function(callback) {
            Category.estimatedDocumentCount(callback);
        },
        copy_count: function(callback) {
            Copy.estimatedDocumentCount(callback);
        },
        author_list: function(callback) {
            Author.find()
            .sort([['family_name', 'ascending']])
            .limit(10)
            .exec(callback)
        },
        book_list: function(callback) {
            Book.find()
            .sort([['date_created', 'descending']])
            .limit(6)
            .populate('author')
            .populate('category')
            .exec(callback)
        }
    }, function(err, results) {

        // A fix to Unescape certain HTML characters
        results.book_list.forEach(function (bookObj){
            bookObj.summary = entities.decode(bookObj.summary);
        });
        
        res.render('index', { title: 'Library Manager using NodeJS/MongoDB', error: err, data: results });
    });

};
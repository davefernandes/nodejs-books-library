var express = require('express');
var router = express.Router();

var bookController = require('../controllers/bookController'); 

/*
* Book Routes
*/

// GET - Create Book Form
router.get('/create', bookController.book_create_get);
// POST - New Book Submission
router.post('/create', bookController.book_create_post);

// GET - Update Book Form
router.get('/:id/update', bookController.book_update_get);
// POST - Update Book Submission
router.post('/:id/update', bookController.book_update_post);

// GET - Confirm delete Book Image.
router.get('/:id/deleteimage', bookController.book_deleteimage_get);

// GET - Confirm delete Book.
router.get('/:id/delete', bookController.book_delete_get);
// POST - Delete Book
router.post('/:id/delete', bookController.book_delete_post);

// GET - Show Book Details
router.get('/:id', bookController.book_detail);

// GET - List Books
router.get('/', bookController.book_list);





module.exports = router;

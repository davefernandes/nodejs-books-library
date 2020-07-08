var express = require('express');
var router = express.Router();

var authorController = require('../controllers/authorController'); 


/*
* Author Routes
*/

// GET - Create Author Form
router.get('/create', authorController.author_create_get);
// POST - New Author Submission
router.post('/create', authorController.author_create_post);

// GET - Update Author Form
router.get('/:id/update', authorController.author_update_get);
// POST - Update Author Submission
router.post('/:id/update', authorController.author_update_post);

// GET - Confirm delete Author.
router.get('/:id/delete', authorController.author_delete_get);
// POST - Delete Author
router.post('/:id/delete', authorController.author_delete_post);

// GET - Show Author Details
router.get('/:id', authorController.author_detail);

// GET - List Authors
router.get('/', authorController.author_list);




module.exports = router;

var express = require('express');
var router = express.Router();

var categoryController = require('../controllers/categoryController'); 

/*
* Category List Route
*/

// GET - Create Category Form
router.get('/create', categoryController.category_create_get);
// POST - New Category Submission
router.post('/create', categoryController.category_create_post);

// GET - Update Category Form
router.get('/:id/update', categoryController.category_update_get);
// POST - Update Category Submission
router.post('/:id/update', categoryController.category_update_post);

// GET - Confirm delete Category.
router.get('/:id/delete', categoryController.category_delete_get);
// POST - Delete Category
router.post('/:id/delete', categoryController.category_delete_post);

// GET - Show Category Details
router.get('/:id', categoryController.category_detail);

router.get('/', categoryController.category_list);





module.exports = router;

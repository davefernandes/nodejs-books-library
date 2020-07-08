var express = require('express');
var router = express.Router();

var copyController = require('../controllers/copyController'); 

/*
* Copy List Route
*/

// GET - Create Copy Form
router.get('/create', copyController.copy_create_get);
// POST - New Copy Submission
router.post('/create', copyController.copy_create_post);

// GET - Update Copy Form
router.get('/:id/update', copyController.copy_update_get);
// POST - Update Copy Submission
router.post('/:id/update', copyController.copy_update_post);

// GET - Confirm delete Copy.
router.get('/:id/delete', copyController.copy_delete_get);
// POST - Delete Copy
router.post('/:id/delete', copyController.copy_delete_post);

// GET - Show Copy Details
router.get('/:id', copyController.copy_detail);

router.get('/', copyController.copy_list);





module.exports = router;

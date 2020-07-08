var express = require('express');
var router = express.Router();

// Import the index controller
var indexController = require('../controllers/indexController'); 

router.get('/', indexController.index);

module.exports = router;

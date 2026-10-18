const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');
router.get('/search', listingController.searchByUniversity);
router.post('/', listingController.createProperty);
module.exports = router;

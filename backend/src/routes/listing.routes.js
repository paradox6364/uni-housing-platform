const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');

router.get('/search', listingController.searchByUniversity);
router.get('/:id', listingController.getPropertyById);
router.post(
  '/',
  authenticate,
  authorizeRole('LANDLORD'),
  listingController.createProperty
);

module.exports = router;
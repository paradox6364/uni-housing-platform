const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listing.controller');
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');

router.get('/search', listingController.searchByUniversity);
router.get(
  '/my',
  authenticate,
  authorizeRole('LANDLORD'),
  listingController.getMyProperties
);
router.get('/:id', listingController.getPropertyById);

router.post(
  '/',
  authenticate,
  authorizeRole('LANDLORD'),
  listingController.createProperty
);
router.put(
  '/:id',
  authenticate,
  authorizeRole('LANDLORD'),
  listingController.updateProperty
);
router.delete(
  '/:id',
  authenticate,
  authorizeRole('LANDLORD'),
  listingController.deleteProperty
);

module.exports = router;
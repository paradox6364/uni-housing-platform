const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.patch('/:id/status', bookingController.updateBookingStatus);
module.exports = router;

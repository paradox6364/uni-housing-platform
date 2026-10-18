const express = require('express');
const router = express.Router();
const uniController = require('../controllers/university.controller');
router.get('/', uniController.getUniversities);
router.post('/', uniController.createUniversity);
module.exports = router;

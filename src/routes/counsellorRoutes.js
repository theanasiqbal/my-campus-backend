
const express = require('express');
const router = express.Router();
const counsellorController = require('../controllers/counsellorController');

// GET /api/counsellors - Get all counsellors
router.get('/', counsellorController.getCounsellors);

// GET /api/counsellors/:id - Get single counsellor
router.get('/:id', counsellorController.getCounsellorById);

module.exports = router;
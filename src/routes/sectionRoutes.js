// sectionRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const sectionController = require('../controllers/sectionController');
const authenticateToken = require('../middleware/authMiddleware'); 

router.post('/', authenticateToken, sectionController.create);
router.get('/', authenticateToken, sectionController.getSections);
router.delete('/:sectionId', authenticateToken, sectionController.deleteSection);

module.exports = router;
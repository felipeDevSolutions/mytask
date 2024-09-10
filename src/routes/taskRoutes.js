// taskRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); 
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, taskController.create);
router.get('/', authenticateToken, taskController.getTasks);
router.put('/:taskId', authenticateToken, taskController.updateTask);
router.delete('/:taskId', authenticateToken, taskController.deleteTask);

module.exports = router;
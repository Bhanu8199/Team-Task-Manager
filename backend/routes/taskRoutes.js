const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/roleMiddleware');
const { createTask, getTasks, updateTaskStatus } = require('../controllers/taskController');

router.use(auth);
router.post('/', requireAdmin('admin'), createTask);
router.get('/', getTasks);
router.patch('/:id', updateTaskStatus);

module.exports = router;

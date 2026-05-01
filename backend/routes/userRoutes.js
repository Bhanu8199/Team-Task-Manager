const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/roleMiddleware');
const { getUsers } = require('../controllers/userController');

router.use(auth);
router.get('/', requireAdmin('admin'), getUsers);

module.exports = router;

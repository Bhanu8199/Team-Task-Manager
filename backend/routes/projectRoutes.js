const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/roleMiddleware');
const {
  createProject,
  getProjects,
  addProjectMember,
  removeProjectMember,
} = require('../controllers/projectController');

router.use(auth);
router.post('/', requireAdmin('admin'), createProject);
router.get('/', getProjects);
router.post('/:projectId/members', requireAdmin('admin'), addProjectMember);
router.delete('/:projectId/members/:userId', requireAdmin('admin'), removeProjectMember);

module.exports = router;

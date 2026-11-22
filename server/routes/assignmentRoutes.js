const express = require('express');
const router = express.Router();
const {
  getAssignmentsByCourse,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.get('/:id', protect, getAssignmentById);
router.post('/course/:courseId', protect, authorize('teacher', 'admin'), createAssignment);
router.put('/:id', protect, authorize('teacher', 'admin'), updateAssignment);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteAssignment);

module.exports = router;

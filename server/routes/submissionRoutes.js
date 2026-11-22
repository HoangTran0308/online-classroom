const express = require('express');
const router = express.Router();
const {
  submitAssignment,
  getSubmissionsByAssignment,
  getSubmissionById,
  gradeSubmission,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/:assignmentId', protect, authorize('student'), upload.single('file'), submitAssignment);
router.get('/assignment/:assignmentId', protect, authorize('teacher', 'admin'), getSubmissionsByAssignment);
router.get('/:id', protect, getSubmissionById);
router.put('/:id/grade', protect, authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;

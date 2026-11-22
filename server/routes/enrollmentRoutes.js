const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  unenrollCourse,
  getMyEnrollments,
  getCourseStudents,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my-courses', protect, authorize('student'), getMyEnrollments);
router.get('/course/:courseId/students', protect, authorize('teacher', 'admin'), getCourseStudents);
router.post('/:courseId', protect, authorize('student'), enrollCourse);
router.delete('/:courseId', protect, authorize('student'), unenrollCourse);

module.exports = router;

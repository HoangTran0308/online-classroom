const express = require('express');
const router = express.Router();
const {
  getCourses,
  getMyTeacherCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getCourses);
router.get('/teacher/my-courses', protect, authorize('teacher', 'admin'), getMyTeacherCourses);
router.get('/:id', optionalAuth, getCourseById);
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);

module.exports = router;

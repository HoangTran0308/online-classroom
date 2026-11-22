const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
  getAllCoursesAdmin,
  toggleCoursePublished,
  deleteCourseAdmin,
  getCategories,
  createCategory,
  deleteCategory,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Tất cả routes trong file này đều yêu cầu đăng nhập và có role admin
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/courses', getAllCoursesAdmin);
router.put('/courses/:id/status', toggleCoursePublished);
router.delete('/courses/:id', deleteCourseAdmin);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;

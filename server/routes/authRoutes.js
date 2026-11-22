const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);

// Route TẠM để thử phân quyền, sẽ xóa sau
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Chào admin' });
});

module.exports = router;
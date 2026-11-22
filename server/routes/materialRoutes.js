const express = require('express');
const router = express.Router();
const {
  getMaterialsByCourse,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/course/:courseId', protect, getMaterialsByCourse);
router.post('/course/:courseId', protect, authorize('teacher', 'admin'), upload.single('file'), createMaterial);
router.put('/:id', protect, authorize('teacher', 'admin'), upload.single('file'), updateMaterial);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteMaterial);

module.exports = router;

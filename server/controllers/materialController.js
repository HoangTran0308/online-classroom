const Material = require('../models/Material');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const fs = require('fs');
const path = require('path');

// Lấy danh sách tài liệu của một khóa học
exports.getMaterialsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    // Kiểm tra quyền truy cập:
    // 1. Giảng viên sở hữu khóa học
    // 2. Admin
    // 3. Sinh viên đã ghi danh
    let hasAccess = false;
    if (req.user) {
      if (req.user.role === 'admin' || course.teacher.toString() === req.user._id.toString()) {
        hasAccess = true;
      } else {
        const enrollment = await Enrollment.findOne({ course: courseId, student: req.user._id });
        if (enrollment) hasAccess = true;
      }
    }

    if (!hasAccess) {
      return res.status(403).json({ message: 'Bạn cần ghi danh vào khóa học để xem tài liệu' });
    }

    const materials = await Material.find({ course: courseId }).sort({ createdAt: 1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Giảng viên thêm tài liệu vào khóa học
exports.createMaterial = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, type, url, content } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm tài liệu vào khóa học này' });
    }

    if (!title || !type) {
      return res.status(400).json({ message: 'Tiêu đề và loại tài liệu là bắt buộc' });
    }

    let fileOrLinkUrl = url || '';
    if (req.file) {
      fileOrLinkUrl = `/uploads/${req.file.filename}`;
    }

    const material = await Material.create({
      course: courseId,
      title,
      type, // 'pdf', 'video', 'reading'
      url: fileOrLinkUrl,
      content: content || '',
    });

    res.status(201).json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật tài liệu
exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
    }

    const course = await Course.findById(material.course);
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa tài liệu này' });
    }

    const { title, type, url, content } = req.body;
    if (title) material.title = title;
    if (type) material.type = type;
    if (content !== undefined) material.content = content;

    if (req.file) {
      material.url = `/uploads/${req.file.filename}`;
    } else if (url !== undefined) {
      material.url = url;
    }

    await material.save();
    res.json(material);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa tài liệu
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Không tìm thấy tài liệu' });
    }

    const course = await Course.findById(material.course);
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa tài liệu này' });
    }

    // Nếu là file upload thì xóa file vật lý
    if (material.url && material.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', material.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Không thể xóa file:', e.message);
        }
      }
    }

    await Material.findByIdAndDelete(material._id);
    res.json({ message: 'Đã xóa tài liệu thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

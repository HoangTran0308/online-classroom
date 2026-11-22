const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Material = require('../models/Material');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// Lấy danh sách khóa học (Công khai hoặc có bộ lọc tìm kiếm, danh mục)
exports.getCourses = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { isPublished: true };

    // Nếu là admin hoặc muốn xem toàn bộ
    if (req.user && req.user.role === 'admin') {
      delete query.isPublished;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All' && category !== 'Tất cả') {
      query.category = category;
    }

    const courses = await Course.find(query)
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    // Đếm số lượng học viên ghi danh cho mỗi khóa học
    const coursesWithStats = await Promise.all(
      courses.map(async (c) => {
        const studentCount = await Enrollment.countDocuments({ course: c._id });
        return {
          ...c.toObject(),
          studentCount,
        };
      })
    );

    res.json(coursesWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách khóa học do giảng viên hiện tại tạo
exports.getMyTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    const coursesWithStats = await Promise.all(
      courses.map(async (c) => {
        const studentCount = await Enrollment.countDocuments({ course: c._id });
        const assignmentCount = await Assignment.countDocuments({ course: c._id });
        const materialCount = await Material.countDocuments({ course: c._id });
        return {
          ...c.toObject(),
          studentCount,
          assignmentCount,
          materialCount,
        };
      })
    );
    res.json(coursesWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Chi tiết 1 khóa học
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    const studentCount = await Enrollment.countDocuments({ course: course._id });
    const assignmentCount = await Assignment.countDocuments({ course: course._id });
    const materialCount = await Material.countDocuments({ course: course._id });

    // Kiểm tra sinh viên hiện tại đã ghi danh hay chưa (nếu đăng nhập)
    let isEnrolled = false;
    if (req.user && req.user.role === 'student') {
      const enroll = await Enrollment.findOne({ course: course._id, student: req.user._id });
      if (enroll) isEnrolled = true;
    }

    res.json({
      ...course.toObject(),
      studentCount,
      assignmentCount,
      materialCount,
      isEnrolled,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Giảng viên hoặc Admin tạo khóa học mới
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, isPublished } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Tiêu đề khóa học là bắt buộc' });
    }

    const newCourse = await Course.create({
      title,
      description: description || '',
      category: category || 'Công nghệ thông tin',
      teacher: req.user._id,
      isPublished: isPublished !== undefined ? isPublished : true,
    });

    const populated = await newCourse.populate('teacher', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Giảng viên cập nhật khóa học của mình (hoặc Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    // Kiểm tra quyền: chỉ giảng viên tạo khóa học hoặc admin mới được sửa
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa khóa học này' });
    }

    const { title, description, category, isPublished } = req.body;
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (isPublished !== undefined) course.isPublished = isPublished;

    await course.save();
    const updated = await course.populate('teacher', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Giảng viên xóa khóa học của mình (hoặc Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa khóa học này' });
    }

    // Cascade delete dữ liệu liên quan
    await Material.deleteMany({ course: course._id });
    await Assignment.deleteMany({ course: course._id });
    await Submission.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.json({ message: 'Đã xóa khóa học thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

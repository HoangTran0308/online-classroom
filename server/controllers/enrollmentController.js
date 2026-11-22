const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Material = require('../models/Material');

// Sinh viên ghi danh vào khóa học
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }
    if (!course.isPublished && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Khóa học này hiện đang đóng' });
    }

    // Kiểm tra đã ghi danh chưa
    const existing = await Enrollment.findOne({ course: courseId, student: studentId });
    if (existing) {
      return res.status(400).json({ message: 'Bạn đã ghi danh vào khóa học này rồi' });
    }

    const enrollment = await Enrollment.create({
      course: courseId,
      student: studentId,
    });

    res.status(201).json({ message: 'Ghi danh khóa học thành công', enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Sinh viên hủy ghi danh
exports.unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOneAndDelete({ course: courseId, student: studentId });
    if (!enrollment) {
      return res.status(404).json({ message: 'Bạn chưa ghi danh vào khóa học này' });
    }

    res.json({ message: 'Đã hủy ghi danh thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách các khóa học mà sinh viên hiện tại đã ghi danh
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    // Lọc bỏ nếu khóa học đã bị xóa
    const validEnrollments = enrollments.filter((e) => e.course != null);

    const result = await Promise.all(
      validEnrollments.map(async (e) => {
        const materialCount = await Material.countDocuments({ course: e.course._id });
        const assignmentCount = await Assignment.countDocuments({ course: e.course._id });
        return {
          enrollmentId: e._id,
          enrolledAt: e.createdAt,
          course: {
            ...e.course.toObject(),
            materialCount,
            assignmentCount,
          },
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Giảng viên hoặc Admin xem danh sách sinh viên ghi danh vào khóa học
exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xem danh sách sinh viên lớp này' });
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email isActive createdAt')
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

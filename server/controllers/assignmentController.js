const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');

// Lấy danh sách bài tập của một khóa học
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    const assignments = await Assignment.find({ course: courseId }).sort({ createdAt: -1 });

    // Đính kèm trạng thái nộp bài cho sinh viên hoặc thống kê cho giảng viên
    const result = await Promise.all(
      assignments.map(async (a) => {
        const item = a.toObject();
        if (req.user && req.user.role === 'student') {
          const mySubmission = await Submission.findOne({
            assignment: a._id,
            student: req.user._id,
          });
          item.mySubmission = mySubmission;
          item.isSubmitted = !!mySubmission;
        } else {
          const submissionCount = await Submission.countDocuments({ assignment: a._id });
          const gradedCount = await Submission.countDocuments({
            assignment: a._id,
            score: { $ne: null },
          });
          item.submissionCount = submissionCount;
          item.gradedCount = gradedCount;
        }
        return item;
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Chi tiết 1 bài tập
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course', 'title teacher');
    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    const item = assignment.toObject();
    if (req.user && req.user.role === 'student') {
      const mySubmission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user._id,
      });
      item.mySubmission = mySubmission;
      item.isSubmitted = !!mySubmission;
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Giảng viên tạo bài tập mới
exports.createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, dueDate, maxScore } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền thêm bài tập vào khóa học này' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Tiêu đề bài tập là bắt buộc' });
    }

    const assignment = await Assignment.create({
      course: courseId,
      title,
      description: description || '',
      dueDate: dueDate || null,
      maxScore: maxScore ? Number(maxScore) : 10,
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật bài tập
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    const course = await Course.findById(assignment.course);
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền sửa bài tập này' });
    }

    const { title, description, dueDate, maxScore } = req.body;
    if (title) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (maxScore !== undefined) assignment.maxScore = maxScore;

    await assignment.save();
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa bài tập
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    const course = await Course.findById(assignment.course);
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa bài tập này' });
    }

    await Submission.deleteMany({ assignment: assignment._id });
    await Assignment.findByIdAndDelete(assignment._id);

    res.json({ message: 'Đã xóa bài tập thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

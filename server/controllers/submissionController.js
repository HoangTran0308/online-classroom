const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// Sinh viên nộp bài tập (văn bản text hoặc upload file)
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { text } = req.body;
    const studentId = req.user._id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    let fileUrl = '';
    let fileName = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    if (!text && !fileUrl) {
      return res.status(400).json({ message: 'Vui lòng nhập nội dung bài nộp hoặc tải lên file đính kèm' });
    }

    // Tìm xem đã nộp trước đó chưa
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    });

    if (submission) {
      // Cập nhật lại bài nộp
      if (text !== undefined) submission.text = text;
      if (fileUrl) {
        submission.fileUrl = fileUrl;
        submission.fileName = fileName;
      }
      submission.score = null; // Reset điểm khi nộp lại
      submission.feedback = '';
      submission.gradedAt = null;
      await submission.save();
      return res.json({ message: 'Cập nhật bài nộp thành công', submission });
    }

    // Nộp mới
    submission = await Submission.create({
      assignment: assignmentId,
      course: assignment.course,
      student: studentId,
      text: text || '',
      fileUrl,
      fileName,
    });

    res.status(201).json({ message: 'Nộp bài tập thành công', submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Giảng viên xem danh sách bài nộp của 1 bài tập
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Không tìm thấy bài tập' });
    }

    const course = await Course.findById(assignment.course);
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền xem danh sách bài nộp của bài tập này' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết 1 bài nộp (Sinh viên xem bài của mình hoặc Giảng viên/Admin)
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email')
      .populate('assignment', 'title description maxScore dueDate');

    if (!submission) {
      return res.status(404).json({ message: 'Không tìm thấy bài nộp' });
    }

    if (
      req.user.role !== 'admin' &&
      submission.student._id.toString() !== req.user._id.toString()
    ) {
      const course = await Course.findById(submission.course);
      if (course.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền xem bài nộp này' });
      }
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Giảng viên chấm điểm bài nộp
exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;

    const submission = await Submission.findById(id).populate('assignment');
    if (!submission) {
      return res.status(404).json({ message: 'Không tìm thấy bài nộp' });
    }

    const course = await Course.findById(submission.course);
    if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bạn không có quyền chấm bài này' });
    }

    if (score === undefined || score === null || isNaN(score)) {
      return res.status(400).json({ message: 'Điểm số phải là một con số hợp lệ' });
    }

    const maxScore = submission.assignment ? submission.assignment.maxScore : 10;
    if (score < 0 || score > maxScore) {
      return res.status(400).json({ message: `Điểm số phải từ 0 đến ${maxScore}` });
    }

    submission.score = Number(score);
    submission.feedback = feedback || '';
    submission.gradedAt = new Date();

    await submission.save();
    const updated = await submission.populate('student', 'name email');

    res.json({ message: 'Chấm điểm thành công', submission: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

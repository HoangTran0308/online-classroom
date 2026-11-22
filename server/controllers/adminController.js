const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Material = require('../models/Material');
const Category = require('../models/Category');

// Thống kê tổng quan hệ thống
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalAssignments = await Assignment.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalCourses,
      totalEnrollments,
      totalAssignments,
      totalSubmissions,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Quản lý người dùng: Lấy danh sách toàn bộ người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Khóa / Mở khóa tài khoản người dùng
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Bạn không thể tự khóa tài khoản của chính mình' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: user.isActive ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản thành công',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật vai trò (Role) người dùng
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'Cập nhật vai trò thành công', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa tài khoản người dùng
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Không thể xóa chính tài khoản đang đăng nhập' });
    }

    // Xóa các dữ liệu liên quan
    await Enrollment.deleteMany({ student: user._id });
    await Submission.deleteMany({ student: user._id });
    // Nếu là giảng viên xóa các khóa học
    if (user.role === 'teacher') {
      const courses = await Course.find({ teacher: user._id });
      for (const c of courses) {
        await Material.deleteMany({ course: c._id });
        await Assignment.deleteMany({ course: c._id });
        await Submission.deleteMany({ course: c._id });
        await Enrollment.deleteMany({ course: c._id });
      }
      await Course.deleteMany({ teacher: user._id });
    }

    await User.findByIdAndDelete(user._id);
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Quản lý danh mục khóa học trên toàn hệ thống
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

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

// Bật / tắt xuất bản khóa học
exports.toggleCoursePublished = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json({
      message: course.isPublished ? 'Đã kích hoạt hiển thị khóa học' : 'Đã ẩn khóa học',
      course,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa khóa học bởi admin
exports.deleteCourseAdmin = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    await Material.deleteMany({ course: course._id });
    await Assignment.deleteMany({ course: course._id });
    await Submission.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.json({ message: 'Admin đã xóa khóa học thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Quản lý Danh mục (Categories)
exports.getCategories = async (req, res) => {
  try {
    let categories = await Category.find().sort({ name: 1 });
    // Nếu chưa có danh mục nào thì khởi tạo mặc định
    if (categories.length === 0) {
      const defaults = [
        { name: 'Công nghệ thông tin', description: 'Lập trình, mạng máy tính, AI, Web' },
        { name: 'Kinh doanh & Khởi nghiệp', description: 'Marketing, quản trị, tài chính' },
        { name: 'Ngoại ngữ', description: 'Tiếng Anh, Tiếng Nhật, Tiếng Hàn' },
        { name: 'Thiết kế đồ họa', description: 'UI/UX, Photoshop, Illustrator' },
        { name: 'Khoa học cơ bản', description: 'Toán học, Vật lý, Hóa học' },
      ];
      categories = await Category.insertMany(defaults);
    }
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Danh mục này đã tồn tại' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.json({ message: 'Đã xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

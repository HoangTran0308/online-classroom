const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Tạo token chứa id của user, hết hạn sau 7 ngày
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Chỉ trả về các thông tin an toàn (không có mật khẩu)
const toPublic = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đủ họ tên, email và mật khẩu' });
    }
    if (role && !['teacher', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò không hợp lệ' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'Email đã được sử dụng' });
    }

    const user = await User.create({ name, email, password, role: role || 'student' });
    res.status(201).json({ token: signToken(user._id), user: toPublic(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    // Phải gọi .select('+password') vì model đang ẩn mật khẩu
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    res.json({ token: signToken(user._id), user: toPublic(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({ user: toPublic(req.user) });
};
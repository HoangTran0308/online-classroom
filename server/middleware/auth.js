const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kiểm tra người dùng đã đăng nhập chưa
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    if (!user.isActive) return res.status(403).json({ message: 'Tài khoản đã bị khóa' });

    req.user = user; // các hàm phía sau dùng req.user để biết ai đang gọi
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cho phép không có token vẫn đi tiếp, nhưng nếu có token hợp lệ thì nạp req.user
exports.optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch {
        // bỏ qua nếu token lỗi
      }
    }
    next();
  } catch {
    next();
  }
};

// Kiểm tra vai trò, ví dụ authorize('teacher') hoặc authorize('teacher', 'admin')
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
  }
  next();
};

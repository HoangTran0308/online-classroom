require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Assignment = require('./models/Assignment');
const Material = require('./models/Material');
const Submission = require('./models/Submission');
const Category = require('./models/Category');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/online_classroom';

async function seedData() {
  try {
    console.log('Đang kết nối MongoDB để khởi tạo dữ liệu mẫu...');
    await mongoose.connect(MONGO_URI);
    console.log('Kết nối thành công. Tiến hành xóa dữ liệu cũ...');

    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Assignment.deleteMany({}),
      Material.deleteMany({}),
      Submission.deleteMany({}),
      Category.deleteMany({}),
    ]);

    console.log('Tạo các danh mục khóa học...');
    const categories = await Category.insertMany([
      { name: 'Công nghệ thông tin', description: 'Lập trình, mạng máy tính, AI, Web' },
      { name: 'Kinh doanh & Khởi nghiệp', description: 'Marketing, quản trị, tài chính' },
      { name: 'Ngoại ngữ', description: 'Tiếng Anh, Tiếng Nhật, Tiếng Hàn' },
      { name: 'Thiết kế đồ họa', description: 'UI/UX, Photoshop, Illustrator' },
      { name: 'Khoa học cơ bản', description: 'Toán học, Vật lý, Hóa học' },
    ]);

    console.log('Tạo tài khoản người dùng mẫu...');
    // Tạo Admin
    const admin = await User.create({
      name: 'Quản Trị Viên (Admin)',
      email: 'admin@classroom.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });

    // Tạo Giảng viên
    const teacher = await User.create({
      name: 'TS. Nguyễn Văn Giảng',
      email: 'teacher@classroom.com',
      password: 'teacher123',
      role: 'teacher',
      isActive: true,
    });

    // Tạo Giảng viên 2
    const teacher2 = await User.create({
      name: 'ThS. Trần Thị Mai',
      email: 'teacher2@classroom.com',
      password: 'teacher123',
      role: 'teacher',
      isActive: true,
    });

    // Tạo Sinh viên 1
    const student1 = await User.create({
      name: 'Trần Thanh Hoàng',
      email: 'student@classroom.com',
      password: 'student123',
      role: 'student',
      isActive: true,
    });

    // Tạo Sinh viên 2
    const student2 = await User.create({
      name: 'Lê Thảo My',
      email: 'student2@classroom.com',
      password: 'student123',
      role: 'student',
      isActive: true,
    });

    console.log('Tạo các khóa học mẫu...');
    const course1 = await Course.create({
      title: 'Lập trình Web nâng cao với MERN Stack (React, Node, Express, MongoDB)',
      description: 'Khóa học cung cấp kiến thức toàn diện từ Frontend React.js đến Backend Express.js và cơ sở dữ liệu MongoDB. Sinh viên sẽ tự tay xây dựng các dự án thực tế chuẩn doanh nghiệp.',
      category: 'Công nghệ thông tin',
      teacher: teacher._id,
      isPublished: true,
    });

    const course2 = await Course.create({
      title: 'Nhập môn Trí tuệ Nhân tạo & Ứng dụng Machine Learning',
      description: 'Khám phá các thuật toán học có giám sát, không giám sát và xây dựng các mô hình dự đoán cơ bản bằng Python và Scikit-Learn.',
      category: 'Công nghệ thông tin',
      teacher: teacher._id,
      isPublished: true,
    });

    const course3 = await Course.create({
      title: 'Tiếng Anh Giao tiếp Chuyên nghiệp cho Dân IT',
      description: 'Rèn luyện kỹ năng viết email, thuyết trình và tham gia phỏng vấn tuyển dụng bằng tiếng Anh trong môi trường công nghệ.',
      category: 'Ngoại ngữ',
      teacher: teacher2._id,
      isPublished: true,
    });

    console.log('Tạo tài liệu học tập (PDF, Video, Bài đọc)...');
    await Material.insertMany([
      {
        course: course1._id,
        title: 'Tài liệu hướng dẫn: Cấu trúc dự án MERN Stack chuẩn (PDF)',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        content: 'Tài liệu PDF chi tiết về kiến trúc Controller - Service - Model trong Node.js.',
      },
      {
        course: course1._id,
        title: 'Video Bài giảng: Xác thực JWT và phân quyền người dùng trong Express',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
        content: 'Video phân tích chi tiết quy trình tạo và xác thực Token JWT.',
      },
      {
        course: course1._id,
        title: 'Bài đọc: 10 Nguyên tắc vàng khi thiết kế RESTful API',
        type: 'reading',
        url: '',
        content: '1. Sử dụng danh từ thay vì động từ cho endpoints (VD: /api/courses thay vì /api/getCourses).\n2. Sử dụng đúng HTTP Methods: GET, POST, PUT, DELETE, PATCH.\n3. Mã phản hồi HTTP chính xác: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Error.\n4. Quản lý phiên bản API (VD: /api/v1/...).\n5. Luôn bảo mật các endpoints nhạy cảm bằng JWT.\n6. Hỗ trợ lọc (Filtering), sắp xếp (Sorting) và phân trang (Pagination).\n7. Luôn validate dữ liệu đầu vào phía server.',
      },
      {
        course: course2._id,
        title: 'Giáo trình Toán cho Học máy (Linear Algebra & Calculus)',
        type: 'pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        content: 'Tài liệu tổng hợp các phép biến đổi ma trận và đạo hàm.',
      },
    ]);

    console.log('Tạo bài tập...');
    const assignment1 = await Assignment.create({
      course: course1._id,
      title: 'Bài tập 1: Xây dựng RESTful API CRUD Khóa học',
      description: 'Yêu cầu sinh viên viết mã nguồn Express.js để tạo các API: Tạo khóa học, Xem danh sách, Cập nhật thông tin và Xóa khóa học. Đính kèm mã nguồn hoặc link github.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
      maxScore: 10,
    });

    const assignment2 = await Assignment.create({
      course: course1._id,
      title: 'Bài tập 2: Thiết kế giao diện Dashboard bằng React Hooks',
      description: 'Sử dụng useState, useEffect và useContext để xây dựng giao diện hiển thị danh sách khóa học và form thêm mới responsive.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 ngày sau
      maxScore: 10,
    });

    console.log('Tạo dữ liệu ghi danh (Enrollment)...');
    await Enrollment.create({
      course: course1._id,
      student: student1._id,
    });

    await Enrollment.create({
      course: course1._id,
      student: student2._id,
    });

    await Enrollment.create({
      course: course2._id,
      student: student1._id,
    });

    console.log('Tạo bài nộp (Submission) và chấm điểm...');
    await Submission.create({
      assignment: assignment1._id,
      course: course1._id,
      student: student1._id,
      text: 'Em xin nộp bài tập 1 ạ. Em đã hoàn thành đầy đủ các chức năng CRUD và viết middleware xác thực JWT chuẩn chỉ. Link github dự án: https://github.com/hoangtran/mern-classroom-api',
      fileUrl: '',
      score: 9.5,
      feedback: 'Bài làm rất tốt, code tổ chức bài bản, clean code và xử lý lỗi chặt chẽ. Đạt điểm cao!',
      gradedAt: new Date(),
    });

    await Submission.create({
      assignment: assignment1._id,
      course: course1._id,
      student: student2._id,
      text: 'Em nộp bài tập 1. Em đã kiểm thử các endpoint qua Postman thành công.',
      fileUrl: '',
      score: null, // Chưa chấm
      feedback: '',
    });

    console.log('\n=============================================');
    console.log('KHỞI TẠO DỮ LIỆU THÀNH CÔNG!');
    console.log('Tài khoản Quản trị (Admin):');
    console.log('   Email: admin@classroom.com | Pass: admin123');
    console.log('Tài khoản Giảng viên (Teacher):');
    console.log('   Email: teacher@classroom.com | Pass: teacher123');
    console.log('Tài khoản Sinh viên (Student):');
    console.log('   Email: student@classroom.com | Pass: student123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi seed dữ liệu:', err);
    process.exit(1);
  }
}

seedData();

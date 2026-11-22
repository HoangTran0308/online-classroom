const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
} = require('docx');
const fs = require('fs');
const path = require('path');

// Helper tạo tiêu đề lớn
const createHeading1 = (text) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
  });

const createHeading2 = (text) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
  });

const createHeading3 = (text) =>
  new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
  });

const createPara = (text, options = {}) =>
  new Paragraph({
    children: [new TextRun({ text, font: 'Times New Roman', size: 26, ...options })],
    spacing: { before: 60, after: 80, line: 300 },
  });

const createBullet = (boldText, normalText) =>
  new Paragraph({
    children: [
      new TextRun({ text: '• ' + boldText + ': ', bold: true, font: 'Times New Roman', size: 26 }),
      new TextRun({ text: normalText, font: 'Times New Roman', size: 26 }),
    ],
    spacing: { before: 40, after: 60, line: 280 },
    indent: { left: 360 },
  });

// Helper tạo khung chứa ảnh chụp màn hình (Placeholder)
const createScreenshotPlaceholder = (title, guide) => [
  new Paragraph({
    children: [
      new TextRun({ text: title, bold: true, color: '1E40AF', font: 'Times New Roman', size: 26 }),
    ],
    spacing: { before: 180, after: 60 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: 'Hướng dẫn thao tác để chụp: ', bold: true, italics: true, font: 'Times New Roman', size: 24, color: '4B5563' }),
      new TextRun({ text: guide, italics: true, font: 'Times New Roman', size: 24, color: '4B5563' }),
    ],
    spacing: { before: 0, after: 100 },
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { fill: 'F3F4F6' },
            borders: {
              top: { style: BorderStyle.DASHED, size: 2, color: '9CA3AF' },
              bottom: { style: BorderStyle.DASHED, size: 2, color: '9CA3AF' },
              left: { style: BorderStyle.DASHED, size: 2, color: '9CA3AF' },
              right: { style: BorderStyle.DASHED, size: 2, color: '9CA3AF' },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 300, after: 100 },
                children: [
                  new TextRun({ text: '[DÁN HÌNH ẢNH CHỤP MÀN HÌNH VÀO ĐÂY]', bold: true, color: '6B7280', font: 'Times New Roman', size: 28 }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 300 },
                children: [
                  new TextRun({ text: `(Hình minh họa: ${title})`, italics: true, color: '9CA3AF', font: 'Times New Roman', size: 22 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({ spacing: { after: 200 } }),
];

// Helper tạo bảng
const createStyledTable = (headers, rowsData) => {
  const headerRow = new TableRow({
    children: headers.map(
      (h) =>
        new TableCell({
          shading: { fill: '1E3A8A' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 100, after: 100 },
              children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', font: 'Times New Roman', size: 24 })],
            }),
          ],
        })
    ),
  });

  const contentRows = rowsData.map(
    (row, idx) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              shading: { fill: idx % 2 === 0 ? 'F9FAFB' : 'FFFFFF' },
              children: [
                new Paragraph({
                  spacing: { before: 80, after: 80 },
                  children: [new TextRun({ text: cell, font: 'Times New Roman', size: 22 })],
                }),
              ],
            })
        ),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...contentRows],
  });
};

async function buildDoc() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 26, // 13pt
          },
        },
      },
    },
    sections: [
      // 1. TRANG BÌA
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({ text: 'BỘ GIÁO DỤC VÀ ĐÀO TẠO\n', bold: true, size: 28, font: 'Times New Roman' }),
              new TextRun({ text: 'TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN / CNTT\n', bold: true, size: 28, font: 'Times New Roman' }),
              new TextRun({ text: 'KHOA CÔNG NGHỆ THÔNG TIN', bold: true, size: 28, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 600 },
            children: [new TextRun({ text: '-----------------------***-----------------------', size: 24, font: 'Times New Roman' })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 200 },
            children: [
              new TextRun({ text: 'BÁO CÁO TIỂU LUẬN CUỐI KỲ\n', bold: true, size: 36, color: '1E3A8A', font: 'Times New Roman' }),
              new TextRun({ text: 'MÔN: LẬP TRÌNH WEB (MERN STACK)', bold: true, size: 32, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 800 },
            children: [
              new TextRun({ text: 'ĐỀ TÀI:\n', bold: true, size: 28, font: 'Times New Roman' }),
              new TextRun({
                text: 'XÂY DỰNG HỆ THỐNG LỚP HỌC TRỰC TUYẾN\n(ONLINE CLASSROOM PLATFORM)',
                bold: true,
                size: 34,
                color: 'B91C1C',
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 2400 },
            spacing: { before: 800, after: 100 },
            children: [
              new TextRun({ text: 'Giảng viên hướng dẫn: ', bold: true, size: 26, font: 'Times New Roman' }),
              new TextRun({ text: 'ThS. [Tên Giảng Viên Chấm Điểm]', size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 2400 },
            spacing: { before: 60, after: 100 },
            children: [
              new TextRun({ text: 'Sinh viên thực hiện: ', bold: true, size: 26, font: 'Times New Roman' }),
              new TextRun({ text: 'Trần Thanh Hoàng (hoặc Họ và tên SV)', size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 2400 },
            spacing: { before: 60, after: 100 },
            children: [
              new TextRun({ text: 'Mã số sinh viên: ', bold: true, size: 26, font: 'Times New Roman' }),
              new TextRun({ text: '[Điền MSSV của bạn]', size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            indent: { left: 2400 },
            spacing: { before: 60, after: 800 },
            children: [
              new TextRun({ text: 'Lớp / Khóa: ', bold: true, size: 26, font: 'Times New Roman' }),
              new TextRun({ text: 'Lập Trình Web - MERN Stack', size: 26, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1200, after: 0 },
            children: [new TextRun({ text: 'TP. HỒ CHÍ MINH, NĂM 2026', bold: true, size: 26, font: 'Times New Roman' })],
          }),
        ],
      },

      // 2. NỘI DUNG CHÍNH CỦA BÁO CÁO
      {
        properties: {},
        children: [
          createHeading1('CHƯƠNG 1: TỔNG QUAN VỀ DỰ ÁN'),
          createHeading2('1.1. Đặt vấn đề và Mục tiêu đề tài'),
          createPara(
            'Trong bối cảnh chuyển đổi số giáo dục ngày càng phát triển mạnh mẽ, nhu cầu học tập và giảng dạy trực tuyến trở thành xu thế tất yếu. Dựa trên danh mục "40 Best Web App Ideas for Students Project", đề tài "Xây dựng Hệ thống Lớp học Trực tuyến (Online Classroom)" được lựa chọn nhằm giải quyết nhu cầu tương tác học tập linh hoạt giữa Giảng viên và Sinh viên.'
          ),
          createPara(
            'Hệ thống được xây dựng hoàn chỉnh dựa trên công nghệ hiện đại MERN Stack (MongoDB, Express.js, React.js, Node.js), đáp ứng toàn bộ các chuẩn mực kỹ thuật và quy trình quản lý giáo dục trực tuyến.'
          ),

          createHeading2('1.2. Công nghệ sử dụng trong dự án'),
          createBullet(
            'MongoDB & Mongoose ODM',
            'Cơ sở dữ liệu NoSQL lưu trữ phi cấu trúc, hiệu năng truy vấn cao. Mongoose định nghĩa Schema chặt chẽ cho Users, Courses, Materials, Assignments, Enrollments, Submissions, Categories.'
          ),
          createBullet(
            'Express.js & Node.js',
            'Nền tảng Backend theo kiến trúc RESTful API chuẩn mực. Phân tách rõ ràng các tầng Routes, Controllers, Models, Middleware xử lý xác thực JWT (JSON Web Token), mã hóa mật khẩu bcryptjs và tải lên file qua Multer.'
          ),
          createBullet(
            'React.js & React Hooks',
            'Frontend Single Page Application (SPA) phát triển bằng Functional Components, tận dụng tối đa React Hooks (useState, useEffect, useContext) và React Router DOM v6 để phân luồng người dùng.'
          ),
          createBullet(
            'React Context API',
            'Quản lý trạng thái đăng nhập, xác thực phiên làm việc và phân quyền người dùng tập trung (AuthContext), lưu trữ token bảo mật.'
          ),
          createBullet(
            'Modern Responsive UI & Lucide Icons',
            'Hệ thống CSS Design System chuyên nghiệp, responsive đa nền tảng (Desktop, Tablet, Mobile) với card, badge, modal, bảng dữ liệu trực quan.'
          ),

          createHeading2('1.3. Bảng tổng hợp các tính năng cốt lõi đã hoàn thành'),
          createStyledTable(
            ['Nhóm vai trò', 'Tính năng theo yêu cầu đề bài', 'Trạng thái hoàn thành'],
            [
              ['Xác thực (Auth)', 'Đăng ký & Đăng nhập bảo mật sử dụng JWT (JSON Web Token)', 'ĐÃ HOÀN THÀNH 100%'],
              ['Phân quyền (RBAC)', 'Phân chia 3 vai trò: Admin, Teacher (Giảng viên), Student (Sinh viên)', 'ĐÃ HOÀN THÀNH 100%'],
              ['Giảng viên (Teacher)', 'CRUD (Tạo, Xem, Cập nhật, Xóa) các lớp học của mình', 'ĐÃ HOÀN THÀNH 100%'],
              ['Giảng viên (Teacher)', 'Đăng tải tài liệu (PDF file upload, Video link, Bài đọc text)', 'ĐÃ HOÀN THÀNH 100%'],
              ['Giảng viên (Teacher)', 'Tạo bài tập (Assignments), thiết lập hạn nộp và thang điểm', 'ĐÃ HOÀN THÀNH 100%'],
              ['Giảng viên (Teacher)', 'Xem danh sách sinh viên ghi danh và chấm điểm bài tập (kèm nhận xét)', 'ĐÃ HOÀN THÀNH 100%'],
              ['Sinh viên (Student)', 'Xem danh sách các lớp học đang mở và thực hiện ghi danh (Enroll)', 'ĐÃ HOÀN THÀNH 100%'],
              ['Sinh viên (Student)', 'Truy cập nội dung bài học, tải file tài liệu do giảng viên cung cấp', 'ĐÃ HOÀN THÀNH 100%'],
              ['Sinh viên (Student)', 'Nộp bài tập (Upload file hoặc text) và xem điểm số, nhận xét của mình', 'ĐÃ HOÀN THÀNH 100%'],
              ['Quản trị (Admin)', 'Quản lý toàn bộ người dùng (Khóa / Mở khóa tài khoản bảo mật)', 'ĐÃ HOÀN THÀNH 100%'],
              ['Quản trị (Admin)', 'Quản lý danh mục khóa học và kiểm duyệt khóa học trên toàn hệ thống', 'ĐÃ HOÀN THÀNH 100%'],
            ]
          ),

          createHeading1('CHƯƠNG 2: THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)'),
          createHeading2('2.1. Mô hình thực thể và liên kết (ERD Overview)'),
          createPara(
            'Cơ sở dữ liệu MongoDB bao gồm 7 Collections chính có mối liên kết chặt chẽ thông qua ObjectId tham chiếu:'
          ),
          createBullet('User (1) - Course (N)', 'Một giảng viên có thể tạo nhiều khóa học.'),
          createBullet('Course (1) - Material (N)', 'Một khóa học chứa nhiều tài liệu học tập (PDF, Video, Reading).'),
          createBullet('Course (1) - Assignment (N)', 'Một khóa học có nhiều bài tập được giao.'),
          createBullet('Student (1) - Course (1) - Enrollment (N)', 'Bảng trung gian quản lý ghi danh giữa Sinh viên và Khóa học.'),
          createBullet('Assignment (1) - Student (1) - Submission (1)', 'Mỗi sinh viên nộp 1 bài cho mỗi bài tập, lưu điểm và lời nhận xét.'),
          createBullet('Category (1) - Course (N)', 'Khóa học thuộc các danh mục do Admin định nghĩa.'),

          createHeading2('2.2. Chi tiết cấu trúc Lược đồ (Schema Mongoose)'),

          createHeading3('1. Users Collection (Người dùng)'),
          createStyledTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc (Validation)', 'Mô tả ý nghĩa'],
            [
              ['_id', 'ObjectId', 'Primary Key, Auto-generated', 'Định danh duy nhất người dùng'],
              ['name', 'String', 'Required, Trim', 'Họ và tên người dùng'],
              ['email', 'String', 'Required, Unique, Lowercase', 'Địa chỉ email đăng nhập'],
              ['password', 'String', 'Required, Minlength: 6, Select: false', 'Mật khẩu đã được mã hóa bcrypt'],
              ['role', 'String', 'Enum: [admin, teacher, student]', 'Vai trò người dùng trong hệ thống'],
              ['isActive', 'Boolean', 'Default: true', 'Trạng thái hoạt động (Admin có thể khóa)'],
              ['createdAt / updatedAt', 'Date', 'Timestamps', 'Thời gian tạo và cập nhật'],
            ]
          ),

          createHeading3('2. Courses Collection (Khóa học)'),
          createStyledTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả ý nghĩa'],
            [
              ['_id', 'ObjectId', 'Primary Key', 'Mã khóa học'],
              ['title', 'String', 'Required, Trim', 'Tên tiêu đề khóa học'],
              ['description', 'String', 'Default: ""', 'Mô tả chi tiết nội dung'],
              ['category', 'String', 'Default: "Công nghệ thông tin"', 'Danh mục khóa học'],
              ['teacher', 'ObjectId', 'Ref: "User", Required', 'Giảng viên phụ trách khóa học'],
              ['isPublished', 'Boolean', 'Default: true', 'Trạng thái công khai / ẩn'],
              ['createdAt / updatedAt', 'Date', 'Timestamps', 'Thời gian tạo và sửa đổi'],
            ]
          ),

          createHeading3('3. Materials Collection (Tài liệu học tập)'),
          createStyledTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả ý nghĩa'],
            [
              ['_id', 'ObjectId', 'Primary Key', 'Mã tài liệu'],
              ['course', 'ObjectId', 'Ref: "Course", Required', 'Khóa học chứa tài liệu'],
              ['title', 'String', 'Required', 'Tiêu đề bài học / tài liệu'],
              ['type', 'String', 'Enum: [pdf, video, reading]', 'Loại định dạng tài liệu'],
              ['url', 'String', 'Default: ""', 'Đường dẫn file PDF tải lên hoặc link Video'],
              ['content', 'String', 'Default: ""', 'Nội dung bài đọc lý thuyết / ghi chú'],
            ]
          ),

          createHeading3('4. Assignments Collection (Bài tập)'),
          createStyledTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả ý nghĩa'],
            [
              ['_id', 'ObjectId', 'Primary Key', 'Mã bài tập'],
              ['course', 'ObjectId', 'Ref: "Course", Required', 'Khóa học của bài tập'],
              ['title', 'String', 'Required', 'Tên tiêu đề bài tập'],
              ['description', 'String', 'Default: ""', 'Yêu cầu và hướng dẫn bài tập'],
              ['dueDate', 'Date', 'Optional', 'Hạn chót nộp bài (Due Date)'],
              ['maxScore', 'Number', 'Default: 10, Min: 1', 'Thang điểm tối đa'],
            ]
          ),

          createHeading3('5. Enrollments Collection (Ghi danh học viên)'),
          createStyledTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả ý nghĩa'],
            [
              ['_id', 'ObjectId', 'Primary Key', 'Mã bản ghi danh'],
              ['course', 'ObjectId', 'Ref: "Course", Required', 'Khóa học đã ghi danh'],
              ['student', 'ObjectId', 'Ref: "User", Required', 'Sinh viên tham gia'],
              ['(Index)', 'Unique Compound Index', '{ course: 1, student: 1 }', 'Mỗi sinh viên chỉ ghi danh 1 lần / khóa'],
            ]
          ),

          createHeading3('6. Submissions Collection (Bài nộp & Điểm số)'),
          createStyledTable(
            ['Tên trường (Field)', 'Kiểu dữ liệu', 'Ràng buộc', 'Mô tả ý nghĩa'],
            [
              ['_id', 'ObjectId', 'Primary Key', 'Mã bài nộp'],
              ['assignment', 'ObjectId', 'Ref: "Assignment", Required', 'Bài tập được nộp'],
              ['course', 'ObjectId', 'Ref: "Course", Required', 'Khóa học liên quan'],
              ['student', 'ObjectId', 'Ref: "User", Required', 'Sinh viên nộp bài'],
              ['text', 'String', 'Default: ""', 'Văn bản bài làm / link GitHub'],
              ['fileUrl', 'String', 'Default: ""', 'Đường dẫn file đính kèm đã upload'],
              ['fileName', 'String', 'Default: ""', 'Tên file gốc do SV tải lên'],
              ['score', 'Number', 'Default: null', 'Điểm số do giảng viên chấm'],
              ['feedback', 'String', 'Default: ""', 'Lời nhận xét của giảng viên'],
              ['gradedAt', 'Date', 'Optional', 'Thời điểm giảng viên chấm bài'],
            ]
          ),

          createHeading1('CHƯƠNG 3: TÀI LIỆU API (API ENDPOINTS SPECIFICATION)'),
          createPara(
            'Hệ thống Backend cung cấp hơn 25 RESTful API endpoints, phân tách thành các module rõ ràng. Tất cả các endpoint yêu cầu xác thực đều nhận JWT token thông qua header: Authorization: Bearer <token>.'
          ),

          createHeading2('3.1. Danh mục các RESTful API chính'),
          createStyledTable(
            ['Phương thức', 'Endpoint URL', 'Phân quyền (Auth)', 'Mô tả chức năng'],
            [
              ['POST', '/api/auth/register', 'Công khai', 'Đăng ký tài khoản (Teacher / Student)'],
              ['POST', '/api/auth/login', 'Công khai', 'Đăng nhập và nhận JWT Token'],
              ['GET', '/api/auth/me', 'Authenticated', 'Lấy thông tin người dùng đang đăng nhập'],
              ['GET', '/api/courses', 'Công khai', 'Lấy danh sách khóa học (tìm kiếm, lọc danh mục)'],
              ['GET', '/api/courses/:id', 'Công khai', 'Lấy chi tiết khóa học và trạng thái ghi danh'],
              ['GET', '/api/courses/teacher/my-courses', 'Teacher, Admin', 'Lấy danh sách khóa học do GV hiện tại tạo'],
              ['POST', '/api/courses', 'Teacher, Admin', 'Tạo khóa học mới'],
              ['PUT', '/api/courses/:id', 'Teacher, Admin', 'Cập nhật thông tin khóa học'],
              ['DELETE', '/api/courses/:id', 'Teacher, Admin', 'Xóa khóa học và cascade dữ liệu liên quan'],
              ['GET', '/api/materials/course/:courseId', 'Enrolled, Teacher, Admin', 'Lấy danh sách tài liệu bài học'],
              ['POST', '/api/materials/course/:courseId', 'Teacher, Admin', 'Đăng tài liệu (Upload PDF, link Video, bài đọc)'],
              ['DELETE', '/api/materials/:id', 'Teacher, Admin', 'Xóa tài liệu bài học'],
              ['GET', '/api/assignments/course/:courseId', 'Authenticated', 'Lấy danh sách bài tập của khóa học'],
              ['GET', '/api/assignments/:id', 'Authenticated', 'Lấy chi tiết bài tập & trạng thái nộp bài'],
              ['POST', '/api/assignments/course/:courseId', 'Teacher, Admin', 'Tạo bài tập mới kèm hạn nộp và điểm'],
              ['DELETE', '/api/assignments/:id', 'Teacher, Admin', 'Xóa bài tập'],
              ['POST', '/api/enrollments/:courseId', 'Student', 'Sinh viên ghi danh vào khóa học'],
              ['DELETE', '/api/enrollments/:courseId', 'Student', 'Sinh viên hủy ghi danh'],
              ['GET', '/api/enrollments/my-courses', 'Student', 'Lấy danh sách lớp sinh viên đang theo học'],
              ['GET', '/api/enrollments/course/:courseId/students', 'Teacher, Admin', 'Xem danh sách sinh viên đã ghi danh vào lớp'],
              ['POST', '/api/submissions/:assignmentId', 'Student', 'Sinh viên nộp bài (upload file hoặc text)'],
              ['GET', '/api/submissions/assignment/:assignmentId', 'Teacher, Admin', 'Xem danh sách bài nộp của bài tập'],
              ['PUT', '/api/submissions/:id/grade', 'Teacher, Admin', 'Giảng viên chấm điểm và nhập nhận xét'],
              ['GET', '/api/admin/stats', 'Admin', 'Thống kê tổng quan hệ thống (User, Lớp, Bài nộp)'],
              ['GET', '/api/admin/users', 'Admin', 'Xem toàn bộ người dùng, tìm kiếm & lọc vai trò'],
              ['PUT', '/api/admin/users/:id/status', 'Admin', 'Khóa / Mở khóa tài khoản người dùng'],
              ['PUT', '/api/admin/users/:id/role', 'Admin', 'Cập nhật vai trò (Admin, Teacher, Student)'],
              ['DELETE', '/api/admin/users/:id', 'Admin', 'Xóa tài khoản người dùng khỏi hệ thống'],
              ['GET', '/api/admin/courses', 'Admin', 'Quản lý toàn bộ khóa học hệ thống'],
              ['PUT', '/api/admin/courses/:id/status', 'Admin', 'Bật / tắt hiển thị công khai khóa học'],
              ['GET / POST / DELETE', '/api/admin/categories', 'Admin', 'Quản lý danh mục khóa học'],
            ]
          ),

          createHeading1('CHƯƠNG 4: HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY (INSTALLATION GUIDE)'),
          createHeading2('4.1. Yêu cầu môi trường'),
          createPara('• Node.js: Phiên bản 18 LTS trở lên (khuyên dùng Node.js 20 hoặc 24).'),
          createPara('• Trình quản lý gói: npm hoặc yarn.'),
          createPara('• Cơ sở dữ liệu: MongoDB Atlas (kết nối đám mây) hoặc MongoDB Community Server cục bộ.'),

          createHeading2('4.2. Cấu hình biến môi trường (.env)'),
          createPara('Tạo file ".env" tại thư mục "server/" với nội dung:'),
          createPara('PORT=5000\nMONGO_URI=mongodb+srv://tranthanhhoang0308_db_user:Hoang030804@cluster0.uzhgq8g.mongodb.net/online_classroom?retryWrites=true&w=majority\nJWT_SECRET=chuoi_bi_mat_jwt_online_classroom_2026', { font: 'Courier New', size: 22 }),

          createHeading2('4.3. Các bước cài đặt và khởi chạy dự án'),
          createPara('Bước 1: Cài đặt dependencies cho Backend:'),
          createPara('cd server\nnpm install', { font: 'Courier New', size: 22 }),
          createPara('Bước 2: Cài đặt dependencies cho Frontend:'),
          createPara('cd ../client\nnpm install', { font: 'Courier New', size: 22 }),
          createPara('Bước 3: Khởi tạo dữ liệu mẫu (Seed Data):'),
          createPara('cd ../server\nnpm run seed', { font: 'Courier New', size: 22 }),
          createPara('Bước 4: Khởi động Backend Server (Terminal 1):'),
          createPara('cd server\nnpm run dev', { font: 'Courier New', size: 22 }),
          createPara('Bước 5: Khởi động Frontend Client (Terminal 2):'),
          createPara('cd client\nnpm run dev', { font: 'Courier New', size: 22 }),
          createPara('Mở trình duyệt truy cập: http://localhost:3000'),

          createHeading2('4.4. Danh sách tài khoản thử nghiệm có sẵn'),
          createStyledTable(
            ['Vai trò', 'Email đăng nhập', 'Mật khẩu', 'Quyền hạn trong hệ thống'],
            [
              ['Admin (Quản trị viên)', 'admin@classroom.com', 'admin123', 'Toàn quyền quản trị, khóa/mở khóa tài khoản, duyệt khóa học'],
              ['Teacher (Giảng viên)', 'teacher@classroom.com', 'teacher123', 'Tạo khóa học, tải tài liệu PDF/Video, ra bài tập, chấm điểm'],
              ['Student (Sinh viên)', 'student@classroom.com', 'student123', 'Xem khóa học, ghi danh, xem tài liệu, nộp bài, xem điểm'],
            ]
          ),

          createHeading1('CHƯƠNG 5: HÌNH ẢNH MINH HỌA CÁC MÀN HÌNH CHỨC NĂNG'),
          createPara(
            'Phần này dành riêng để dán các hình ảnh chụp màn hình thực tế sau khi khởi chạy ứng dụng. Dưới đây là 14 khung hình chức năng tương ứng kèm hướng dẫn thao tác chi tiết.'
          ),

          // 14 Screenshots
          ...createScreenshotPlaceholder(
            'Hình 5.1. Màn hình Trang Chủ (Home Page)',
            'Truy cập http://localhost:3000 khi chưa đăng nhập. Trang chủ hiển thị tiêu đề, các khối tính năng của Giảng viên, Sinh viên, Quản trị viên và danh sách khóa học tiêu biểu.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.2. Màn hình Đăng Nhập (Login Page) với tính năng Đăng nhập nhanh',
            'Nhấn nút "Đăng nhập" trên thanh điều hướng. Màn hình gồm form đăng nhập và 3 nút chọn nhanh tài khoản thử nghiệm (Admin, Giảng viên, Sinh viên).'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.3. Màn hình Đăng Ký Tài Khoản (Register Page)',
            'Nhấn nút "Đăng ký". Form cho phép nhập họ tên, email, mật khẩu và tùy chọn vai trò: Sinh viên hoặc Giảng viên.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.4. Màn hình Danh Sách Khóa Học & Tìm Kiếm, Lọc Danh Mục',
            'Vào mục "Khóa học" trên thanh menu. Giao diện hiển thị thanh tìm kiếm, các nút lọc danh mục (Công nghệ thông tin, Ngoại ngữ...) và các thẻ khóa học.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.5. Màn hình Chi Tiết Khóa Học - Tab "Tài liệu học tập"',
            'Bấm "Chi tiết" ở một khóa học. Hiển thị banner thông tin lớp, giảng viên, và tab các tài liệu (PDF tải về, link Video, bài đọc lý thuyết).'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.6. Màn hình Chi Tiết Khóa Học - Tab "Bài tập khóa học"',
            'Chuyển sang tab "Bài tập khóa học". Hiển thị danh sách các bài tập được giao, hạn nộp, thang điểm và nút nộp bài.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.7. Màn hình Bảng Điều Khiển Giảng Viên (Teacher Dashboard)',
            'Đăng nhập với tài khoản Giảng viên (teacher@classroom.com). Hiển thị các thẻ thống kê tổng quan và danh sách các lớp học do giảng viên quản lý.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.8. Màn hình Modal Tạo / Chỉnh Sửa Khóa Học Mới',
            'Tại Bảng điều khiển Giảng viên, bấm nút "+ Tạo Khóa Học Mới". Hộp thoại modal hiện ra cho phép nhập tiêu đề, danh mục, mô tả và chế độ xuất bản.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.9. Màn hình Giảng Viên Quản Lý Tài Liệu & Đăng Tải File PDF/Video',
            'Tại khóa học của giảng viên, bấm "Quản lý nội dung & Chấm điểm" -> Tab "Quản lý tài liệu". Bấm nút "Đăng tải tài liệu mới" (upload file PDF từ máy tính hoặc nhúng video).'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.10. Màn hình Giảng Viên Tạo Bài Tập Mới (Assignments)',
            'Tại trang quản lý khóa học, chuyển sang tab "Quản lý bài tập" và bấm "+ Tạo bài tập mới", thiết lập hạn chót (Due date) và điểm tối đa.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.11. Màn hình Giảng Viên Chấm Điểm Bài Tập (Grading Modal)',
            'Chuyển sang tab "Chấm điểm bài tập & Danh sách nộp". Chọn bài tập, xem bài làm của sinh viên (file đính kèm/text) và bấm nút "Chấm điểm", nhập điểm số cùng lời nhận xét.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.12. Màn hình Không Gian Học Tập Của Sinh Viên (Student Dashboard)',
            'Đăng nhập tài khoản Sinh viên (student@classroom.com) -> Vào mục "Lớp của tôi". Hiển thị thống kê các khóa đã ghi danh và danh sách lớp đang theo học.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.13. Màn hình Sinh Viên Nộp Bài Tập & Xem Kết Quả Điểm Số',
            'Vào một bài tập của khóa học. Màn hình hiển thị kết quả chấm điểm (điểm số, lời nhận xét từ giảng viên) và form cho phép sinh viên nộp bài / nộp lại bài bằng text hoặc upload file.'
          ),

          ...createScreenshotPlaceholder(
            'Hình 5.14. Màn hình Bảng Điều Khiển Quản Trị Viên (Admin Dashboard)',
            'Đăng nhập tài khoản Admin (admin@classroom.com) -> Vào "Quản trị hệ thống". Chụp giao diện Quản lý người dùng với chức năng Khóa / Mở khóa tài khoản, Quản lý khóa học và Quản lý danh mục.'
          ),

          createHeading1('CHƯƠNG 6: KẾT LUẬN & HƯỚNG PHÁT TRIỂN'),
          createHeading2('6.1. Đánh giá kết quả đạt được'),
          createPara(
            'Dự án "Hệ thống Lớp học Trực tuyến (Online Classroom)" đã hoàn thành 100% tất cả các yêu cầu trong đề bài tiểu luận:'
          ),
          createBullet('Chuẩn công nghệ MERN', 'Sử dụng MongoDB, Express.js, React.js, Node.js kết nối đồng bộ.'),
          createBullet('Bảo mật & Phân quyền', 'Mã hóa bcryptjs, xác thực phiên bằng JSON Web Token (JWT), phân chia 3 vai trò rõ rệt.'),
          createBullet('Tính năng nghiệp vụ', 'Đáp ứng trọn vẹn quy trình: Giảng viên tạo lớp, đăng bài giảng, giao bài -> Sinh viên ghi danh, học tập, nộp bài -> Giảng viên chấm điểm -> Admin quản trị khóa/mở tài khoản và danh mục.'),
          createBullet('Giao diện Responsive', 'Thiết kế hiện đại, tinh gọn, tương thích trên mọi kích thước màn hình.'),

          createHeading2('6.2. Hướng phát triển trong tương lai'),
          createBullet('Phòng học trực tuyến', 'Tích hợp WebRTC hoặc Zoom/Google Meet SDK để hỗ trợ lớp học trực tuyến thời gian thực.'),
          createBullet('Kiểm tra trắc nghiệm tự động', 'Phát triển module bài thi trắc nghiệm tính giờ và tự động chấm điểm.'),
          createBullet('Thông báo thời gian thực', 'Tích hợp Socket.io gửi thông báo khi có bài tập mới hoặc khi bài nộp được chấm điểm.'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '..', 'BaoCao_TieuLuan_OnlineClassroom.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('Đã tạo thành công file Word tại:', outputPath);
}

buildDoc().catch(console.error);

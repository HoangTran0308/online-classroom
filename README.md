# Hệ Thống Lớp Học Trực Tuyến (Online Classroom)
> **Đề tài Tiểu luận Cuối kỳ môn Lập trình Web - Công nghệ MERN Stack**

---

## 📖 1. Giới Thiệu Dự Án
Dự án **Hệ thống Lớp học Trực tuyến (Online Classroom)** được xây dựng nhằm cung cấp một nền tảng học tập số hóa toàn diện, kết nối mật thiết giữa Giảng viên và Sinh viên, dưới sự kiểm soát và quản trị tập trung của Quản trị viên (Admin).

### 🛠️ Công Nghệ Sử Dụng (MERN Stack):
- **MongoDB**: Cơ sở dữ liệu NoSQL lưu trữ thông tin Người dùng, Khóa học, Tài liệu, Bài tập, Ghi danh và Bài nộp.
- **Express.js**: Framework backend định tuyến và xử lý các RESTful API endpoints an toàn, tách biệt mô hình MVC.
- **React.js**: Thư viện frontend xây dựng Single Page Application (SPA) với React Hooks, Context API và giao diện Responsive.
- **Node.js**: Nền tảng thực thi JavaScript phía máy chủ, tích hợp bảo mật JWT (JSON Web Token) và Multer xử lý upload file.

---

## 🌟 2. Các Tính Năng Cốt Lõi (Core Features)

### 🔐 Xác thực & Phân quyền (Authentication & Authorization):
- Đăng ký và đăng nhập bảo mật bằng cơ chế **JWT (JSON Web Token)** và mã hóa mật khẩu với **bcryptjs**.
- Phân chia 3 vai trò rõ rệt: **Admin (Quản trị viên)**, **Teacher (Giảng viên)**, **Student (Sinh viên)**.

### 👨‍🏫 Chức năng Giảng viên (Teacher):
- **CRUD Khóa học**: Tạo mới, xem danh sách, cập nhật thông tin và xóa khóa học do mình phụ trách.
- **Quản lý Tài liệu**: Đăng tải tài liệu học tập đa định dạng (Upload file PDF/Word, nhúng Video link YouTube, viết bài đọc lý thuyết).
- **Quản lý Bài tập**: Tạo bài tập kèm mô tả, hạn nộp (Due Date) và thang điểm tối đa.
- **Quản lý Sinh viên & Chấm điểm**: Xem danh sách học viên đã ghi danh vào lớp, tải file bài nộp hoặc xem văn bản nộp của học viên, chấm điểm và gửi lời nhận xét chi tiết.

### 👨‍🎓 Chức năng Sinh viên (Student):
- **Khám phá & Ghi danh (Enroll)**: Tìm kiếm theo từ khóa, lọc theo danh mục và nhấn nút ghi danh tham gia khóa học.
- **Học tập trực tuyến**: Truy cập tài liệu bài giảng, xem video hướng dẫn, tải file PDF tài liệu về máy.
- **Nộp bài tập**: Nhập nội dung bài làm / link GitHub / tải file đính kèm bài tập.
- **Xem điểm số**: Theo dõi trạng thái đã nộp / chưa nộp, xem điểm số và nhận xét từ giảng viên sau khi được chấm.

### 👑 Chức năng Quản trị (Admin):
- **Quản lý toàn bộ người dùng**: Danh sách toàn bộ tài khoản, chức năng **Khóa / Mở khóa tài khoản** bảo mật, thay đổi vai trò hoặc xóa tài khoản.
- **Quản lý khóa học toàn hệ thống**: Bật/tắt trạng thái hiển thị công khai hoặc ẩn khóa học, xóa khóa học vi phạm.
- **Quản lý danh mục khóa học**: Thêm mới, chỉnh sửa và xóa danh mục hệ thống.
- **Thống kê tổng quan**: Số lượng người dùng, giảng viên, sinh viên, khóa học, lượt ghi danh, bài tập và bài nộp.

---

## 🚀 3. Hướng Dẫn Cài Đặt & Khởi Chạy Cục Bộ (Installation Guide)

### 3.1. Yêu cầu hệ thống:
- Đã cài đặt **Node.js** (Khuyến nghị phiên bản LTS từ 18 trở lên).
- Trình quản lý gói **npm** hoặc **yarn**.
- Kết nối Internet (để kết nối MongoDB Atlas) hoặc MongoDB Community Server cài trên máy.

### 3.2. Cài đặt các gói thư viện (Dependencies):

```bash
# 1. Cài đặt thư viện cho Backend (server)
cd server
npm install

# 2. Cài đặt thư viện cho Frontend (client)
cd ../client
npm install
```

### 3.3. Cấu hình biến môi trường (.env):
Tạo file `.env` bên trong thư mục `server/` với nội dung mẫu:
```env
PORT=5000
MONGO_URI=mongodb+srv://tranthanhhoang0308_db_user:Hoang030804@cluster0.uzhgq8g.mongodb.net/online_classroom?retryWrites=true&w=majority
JWT_SECRET=chuoi_bi_mat_jwt_online_classroom_2026
```

### 3.4. Khởi tạo dữ liệu mẫu (Seed Data):
Hệ thống đã có sẵn tập lệnh khởi tạo toàn bộ dữ liệu mẫu (Tài khoản mẫu, khóa học mẫu, tài liệu, bài tập, bài nộp):
```bash
cd server
npm run seed
```

### 3.5. Chạy ứng dụng:

**Bước 1: Chạy Backend Server** (Mở Terminal 1):
```bash
cd server
npm run dev
# Server sẽ lắng nghe tại: http://localhost:5000
```

**Bước 2: Chạy Frontend Client** (Mở Terminal 2):
```bash
cd client
npm run dev
# Giao diện web sẽ chạy tại: http://localhost:3000
```

Truy cập trình duyệt: `http://localhost:3000`

---

## 🔑 4. Danh Sách Tài Khoản Mẫu Để Thử Nghiệm

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | `admin@classroom.com` | `admin123` | Toàn quyền quản trị hệ thống, khóa/mở tài khoản |
| **Giảng Viên (Teacher)** | `teacher@classroom.com` | `teacher123` | Quản lý khóa học, đăng bài giảng, chấm điểm |
| **Sinh Viên (Student)** | `student@classroom.com` | `student123` | Ghi danh học tập, nộp bài, xem điểm số |

*(Tại màn hình Đăng nhập của ứng dụng có tích hợp sẵn 3 nút nhấn nhanh để tự động điền các tài khoản này).*

---

## 📁 5. Cấu Trúc Mã Nguồn Dự Án

```
online-classroom/
├── client/                      # Giao diện Frontend (React.js + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/api.js           # Cấu hình Axios & JWT interceptor
│   │   ├── components/          # Navbar, Footer, ProtectedRoute
│   │   ├── context/AuthContext  # Quản lý state đăng nhập tập trung
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── CourseDetailPage.jsx
│   │   │   ├── teacher/         # Dashboard & Quản lý bài tập GV
│   │   │   ├── student/         # Dashboard & Nộp bài tập SV
│   │   │   └── admin/           # Dashboard Quản trị hệ thống
│   │   ├── App.jsx              # Định tuyến Routes
│   │   ├── index.css            # Hệ thống CSS Design System chuẩn mực
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Máy chủ Backend (Node.js & Express)
│   ├── controllers/             # auth, course, material, assignment, enrollment, submission, admin
│   ├── middleware/              # auth.js (JWT protect & authorize), upload.js (Multer)
│   ├── models/                  # User, Course, Material, Assignment, Enrollment, Submission, Category
│   ├── routes/                  # authRoutes, courseRoutes, materialRoutes, assignmentRoutes, ...
│   ├── uploads/                 # Thư mục lưu trữ file tĩnh upload
│   ├── seed.js                  # Kịch bản khởi tạo CSDL mẫu
│   ├── server.js                # Điểm khởi động Server & cấu hình Middleware
│   ├── package.json
│   └── .env
│
├── .gitignore                   # Loại trừ node_modules và .env
├── package.json                 # Root script
└── README.md                    # Hướng dẫn chi tiết
```

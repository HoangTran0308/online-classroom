import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedCourses();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'white', borderBottom: '1px solid var(--gray-200)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 1rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <GraduationCap size={18} />
            <span>Đề Tài Tiểu Luận Cuối Kỳ - MERN Stack</span>
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '1.25rem', letterSpacing: '-0.025em' }}>
            Hệ Thống Lớp Học Trực Tuyến <br />
            <span style={{ color: 'var(--primary)' }}>Online Classroom Platform</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--gray-600)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Nền tảng kết nối giảng viên và sinh viên toàn diện. Hỗ trợ tạo khóa học, chia sẻ tài liệu đa phương tiện (PDF, Video, Bài đọc), giao bài tập và chấm điểm bài tập trực tiếp trên hệ thống.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-primary btn-lg">
              <BookOpen size={18} />
              <span>Khám phá khóa học</span>
              <ArrowRight size={18} />
            </Link>
            {!isAuthenticated ? (
              <Link to="/login" className="btn btn-secondary btn-lg">
                Đăng nhập hệ thống
              </Link>
            ) : (
              <Link
                to={user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/student'}
                className="btn btn-secondary btn-lg"
              >
                Vào Bảng Điều Khiển ({user?.role?.toUpperCase()})
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Roles Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Tính Năng Cốt Lõi Hệ Thống</h2>
            <p style={{ color: 'var(--gray-600)' }}>Được thiết kế phân quyền chuyên biệt cho 3 nhóm đối tượng người dùng</p>
          </div>

          <div className="grid-cols-3">
            {/* Giảng viên */}
            <div className="card card-hover" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Dành Cho Giảng Viên</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>CRUD (Tạo, xem, sửa, xóa) các lớp học của mình</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Đăng tải tài liệu (PDF, Video link, Bài đọc text)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Tạo bài tập và đặt hạn nộp (Due Date)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Xem danh sách sinh viên ghi danh và chấm điểm bài tập</span>
                </li>
              </ul>
            </div>

            {/* Sinh viên */}
            <div className="card card-hover" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <GraduationCap size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Dành Cho Sinh Viên</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Xem danh sách lớp mở và ghi danh tham gia (Enroll)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Truy cập bài học, xem video, tải file tài liệu PDF</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Nộp bài tập (Upload file hoặc nhập văn bản)</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Xem điểm số và nhận xét chi tiết từ giảng viên</span>
                </li>
              </ul>
            </div>

            {/* Quản trị viên */}
            <div className="card card-hover" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Dành Cho Quản Trị Viên</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Quản lý người dùng: Khóa/Mở khóa tài khoản bảo mật</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Quản lý danh mục khóa học trên toàn hệ thống</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Kiểm duyệt và quản lý tất cả các lớp học</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>Báo cáo thống kê toàn diện về hoạt động dạy và học</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Preview */}
      <section style={{ backgroundColor: 'white', padding: '4rem 0', borderTop: '1px solid var(--gray-200)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem' }}>Khóa Học Tiêu Biểu</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Các lớp học mới nhất đang mở ghi danh</p>
            </div>
            <Link to="/courses" className="btn btn-outline-primary">
              <span>Xem tất cả</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-500)' }}>Đang tải danh sách khóa học...</p>
          ) : (
            <div className="grid-cols-3">
              {courses.map((course) => (
                <div key={course._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '140px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', padding: '1.5rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span className="badge badge-warning" style={{ alignSelf: 'flex-start' }}>{course.category}</span>
                    <h3 style={{ color: 'white', fontSize: '1.1rem', lineClamp: 2 }}>{course.title}</h3>
                  </div>
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1.25rem', flex: 1 }}>
                      {course.description || 'Chưa có mô tả chi tiết cho khóa học này.'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gray-500)', borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem' }}>
                      <span>GV: <strong>{course.teacher?.name}</strong></span>
                      <span className="badge badge-primary">{course.studentCount || 0} học viên</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <Link to={`/courses/${course._id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                      Chi tiết & Ghi danh
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;

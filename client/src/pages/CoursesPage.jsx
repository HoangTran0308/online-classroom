import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  BookOpen,
  Search,
  Users,
  GraduationCap,
  Filter,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const CoursesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'Tất cả') params.category = selectedCategory;

      const res = await api.get('/courses', { params });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/admin/categories');
        setCategories(['Tất cả', ...res.data.map((c) => c.name)]);
      } catch (err) {
        // Fallback categories nếu chưa đăng nhập admin
        setCategories([
          'Tất cả',
          'Công nghệ thông tin',
          'Kinh doanh & Khởi nghiệp',
          'Ngoại ngữ',
          'Thiết kế đồ họa',
          'Khoa học cơ bản',
        ]);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      return navigate('/login');
    }
    if (user.role !== 'student') {
      alert('Chỉ tài khoản Sinh viên mới có thể ghi danh vào khóa học');
      return;
    }

    try {
      setActionLoadingId(courseId);
      await api.post(`/enrollments/${courseId}`);
      setMessage('Ghi danh khóa học thành công! Bạn có thể vào học ngay bây giờ.');
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi ghi danh');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Danh Sách Khóa Học Đang Mở</h1>
        <p style={{ color: 'var(--gray-600)' }}>
          Khám phá và tham gia các khóa học chất lượng cao từ đội ngũ giảng viên.
        </p>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm theo tên khóa học hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Search size={16} />
            <span>Tìm kiếm</span>
          </button>
        </form>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Filter size={14} /> Danh mục:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
          Đang tải danh sách khóa học...
        </p>
      ) : courses.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
          <h3>Không tìm thấy khóa học nào phù hợp</h3>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
            Vui lòng thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.
          </p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {courses.map((course) => (
            <div key={course._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  height: '140px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                  padding: '1.25rem',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <span className="badge badge-warning" style={{ alignSelf: 'flex-start' }}>
                  {course.category}
                </span>
                <h3 style={{ color: 'white', fontSize: '1.15rem' }}>{course.title}</h3>
              </div>

              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1.25rem', flex: 1, lineHeight: 1.5 }}>
                  {course.description || 'Chưa có thông tin mô tả chi tiết cho lớp học này.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--gray-500)',
                    borderTop: '1px solid var(--gray-100)',
                    paddingTop: '0.75rem',
                  }}
                >
                  <span>
                    Giảng viên: <strong>{course.teacher?.name}</strong>
                  </span>
                  <span className="badge badge-primary">
                    <Users size={12} /> {course.studentCount || 0} học viên
                  </span>
                </div>
              </div>

              <div className="card-footer" style={{ gap: '0.5rem' }}>
                <Link to={`/courses/${course._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  Chi tiết
                </Link>

                {user?.role === 'student' && (
                  <button
                    onClick={() => handleEnroll(course._id)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    disabled={actionLoadingId === course._id}
                  >
                    {actionLoadingId === course._id ? 'Đang xử lý...' : 'Ghi Danh'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;

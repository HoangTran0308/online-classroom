import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import {
  BookOpen,
  Plus,
  Users,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Công nghệ thông tin',
    isPublished: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeacherCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses/teacher/my-courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.map((c) => c.name));
    } catch (err) {
      setCategories([
        'Công nghệ thông tin',
        'Kinh doanh & Khởi nghiệp',
        'Ngoại ngữ',
        'Thiết kế đồ họa',
        'Khoa học cơ bản',
      ]);
    }
  };

  useEffect(() => {
    fetchTeacherCourses();
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      category: categories[0] || 'Công nghệ thông tin',
      isPublished: true,
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      isPublished: course.isPublished,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, formData);
        setSuccess('Cập nhật khóa học thành công!');
      } else {
        await api.post('/courses', formData);
        setSuccess('Tạo khóa học mới thành công!');
      }
      setModalOpen(false);
      fetchTeacherCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleDelete = async (courseId, courseTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${courseTitle}"? Dữ liệu tài liệu, bài tập và bài nộp liên quan sẽ bị xóa hoàn toàn.`)) {
      try {
        await api.delete(`/courses/${courseId}`);
        setSuccess('Đã xóa khóa học thành công!');
        fetchTeacherCourses();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa khóa học');
      }
    }
  };

  // Thống kê
  const totalStudents = courses.reduce((acc, c) => acc + (c.studentCount || 0), 0);
  const totalAssignments = courses.reduce((acc, c) => acc + (c.assignmentCount || 0), 0);
  const totalMaterials = courses.reduce((acc, c) => acc + (c.materialCount || 0), 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Bảng Điều Khiển Giảng Viên</h1>
          <p style={{ color: 'var(--gray-600)' }}>Quản lý các khóa học, tài liệu giảng dạy và bài tập của bạn</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>Tạo Khóa Học Mới</span>
        </button>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{courses.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Khóa học của tôi</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalStudents}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Tổng lượt sinh viên</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: '#b45309' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalAssignments}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Bài tập đã tạo</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalMaterials}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Tài liệu đã đăng</div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Danh Sách Khóa Học Của Tôi</h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>Đang tải khóa học...</p>
      ) : courses.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <BookOpen size={48} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
          <h3>Bạn chưa tạo khóa học nào</h3>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Hãy bắt đầu bằng việc tạo khóa học đầu tiên để chia sẻ kiến thức với sinh viên.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Tạo Khóa Học Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="grid-cols-2">
          {courses.map((course) => (
            <div key={course._id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-warning">{course.category}</span>
                  {course.isPublished ? (
                    <span className="badge badge-success">Công khai</span>
                  ) : (
                    <span className="badge badge-danger">Bản nháp / Đã ẩn</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={() => openEditModal(course)}
                    className="btn btn-secondary btn-sm"
                    title="Sửa thông tin"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(course._id, course.title)}
                    className="btn btn-outline-danger btn-sm"
                    title="Xóa khóa học"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-body" style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{course.title}</h3>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {course.description || 'Chưa có mô tả.'}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                  <span><Users size={14} /> <strong>{course.studentCount || 0}</strong> học viên</span>
                  <span><FileText size={14} /> <strong>{course.assignmentCount || 0}</strong> bài tập</span>
                  <span><Layers size={14} /> <strong>{course.materialCount || 0}</strong> tài liệu</span>
                </div>
              </div>

              <div className="card-footer" style={{ gap: '0.75rem' }}>
                <Link to={`/courses/${course._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  <ExternalLink size={14} /> Xem giao diện học viên
                </Link>
                <Link to={`/teacher/courses/${course._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Quản lý nội dung & Chấm điểm
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create / Edit Course */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingCourse ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--gray-500)' }}
              >
                &times;
              </button>
            </div>

            {error && (
              <div style={{ margin: '1rem 1.5rem 0' }}>
                <div className="alert alert-danger">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên khóa học *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: Lập trình Web MERN Stack"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Danh mục khóa học</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả khóa học</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Mô tả tóm tắt nội dung và mục tiêu đầu ra..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Xuất bản công khai (Cho phép sinh viên tìm kiếm và ghi danh)
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? 'Lưu Thay Đổi' : 'Tạo Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

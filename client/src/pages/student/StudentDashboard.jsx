import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  XCircle,
  CheckCircle,
} from 'lucide-react';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/enrollments/my-courses');
      setEnrollments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEnrollments();
  }, []);

  const handleUnenroll = async (courseId, courseTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy ghi danh khỏi khóa học "${courseTitle}"?`)) {
      try {
        await api.delete(`/enrollments/${courseId}`);
        setMessage('Đã hủy ghi danh thành công.');
        fetchMyEnrollments();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi hủy ghi danh');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Không Gian Học Tập Của Tôi</h1>
          <p style={{ color: 'var(--gray-600)' }}>
            Theo dõi tiến trình học tập, tài liệu bài giảng và hạn nộp bài tập
          </p>
        </div>
        <Link to="/courses" className="btn btn-primary">
          <BookOpen size={18} />
          <span>Khám phá thêm khóa học</span>
        </Link>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{enrollments.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Khóa học đã ghi danh</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {enrollments.reduce((sum, e) => sum + (e.course?.materialCount || 0), 0)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Tài liệu bài học sẵn có</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: '#b45309' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {enrollments.reduce((sum, e) => sum + (e.course?.assignmentCount || 0), 0)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Bài tập cần hoàn thành</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Danh Sách Khóa Học Đang Theo Học</h2>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>Đang tải danh sách khóa học...</p>
      ) : enrollments.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <GraduationCap size={48} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
          <h3>Bạn chưa ghi danh vào khóa học nào</h3>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Hãy ghé thăm danh mục khóa học để chọn những lớp học phù hợp và bắt đầu học tập ngay hôm nay!
          </p>
          <Link to="/courses" className="btn btn-primary">
            Khám Phá Khóa Học
          </Link>
        </div>
      ) : (
        <div className="grid-cols-2">
          {enrollments.map((item) => {
            const c = item.course;
            return (
              <div key={item.enrollmentId} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">
                  <span className="badge badge-warning">{c?.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    Tham gia: {new Date(item.enrolledAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="card-body" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{c?.title}</h3>
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {c?.description || 'Chưa có thông tin mô tả chi tiết.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--gray-600)' }}>
                      Giảng viên: <strong>{c?.teacher?.name}</strong>
                    </span>
                    <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--gray-500)' }}>
                      <span><Layers size={14} /> {c?.materialCount || 0} tài liệu</span>
                      <span><FileText size={14} /> {c?.assignmentCount || 0} bài tập</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer" style={{ gap: '0.75rem' }}>
                  <button
                    onClick={() => handleUnenroll(c?._id, c?.title)}
                    className="btn btn-secondary btn-sm"
                    title="Hủy ghi danh"
                  >
                    <XCircle size={14} /> Hủy ghi danh
                  </button>
                  <Link to={`/courses/${c?._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <span>Vào Lớp Học Ngay</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

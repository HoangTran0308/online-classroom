import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import {
  BookOpen,
  FileText,
  Video,
  FileCode,
  Users,
  CheckCircle,
  Clock,
  Award,
  ExternalLink,
  Download,
  AlertCircle,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('materials');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const resCourse = await api.get(`/courses/${id}`);
      setCourse(resCourse.data);

      // Nếu đã ghi danh hoặc là giảng viên/admin thì tải tài liệu & bài tập
      const canAccess =
        resCourse.data.isEnrolled ||
        (user && (user.role === 'admin' || resCourse.data.teacher?._id === user.id));

      if (canAccess) {
        try {
          const resMat = await api.get(`/materials/course/${id}`);
          setMaterials(resMat.data);
        } catch (e) {
          console.warn('Chưa có quyền xem tài liệu');
        }

        try {
          const resAssign = await api.get(`/assignments/course/${id}`);
          setAssignments(resAssign.data);
        } catch (e) {
          console.warn('Chưa có quyền xem bài tập');
        }

        if (user && (user.role === 'admin' || resCourse.data.teacher?._id === user.id)) {
          try {
            const resStudents = await api.get(`/enrollments/course/${id}/students`);
            setStudents(resStudents.data);
          } catch (e) {
            console.warn('Lỗi lấy danh sách học viên');
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (user.role !== 'student') {
      return alert('Chỉ có sinh viên mới có thể ghi danh vào lớp');
    }

    try {
      setEnrolling(true);
      await api.post(`/enrollments/${id}`);
      setSuccessMsg('Ghi danh thành công! Bạn có thể xem toàn bộ bài giảng và làm bài tập.');
      fetchCourseData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi ghi danh');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-500)' }}>Đang tải nội dung khóa học...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={18} />
          <span>{error || 'Không tìm thấy khóa học'}</span>
        </div>
        <Link to="/courses" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} /> Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  const isTeacherOrAdmin =
    user && (user.role === 'admin' || course.teacher?._id === user.id);
  const isEnrolledStudent = user?.role === 'student' && course.isEnrolled;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Back button */}
      <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gray-600)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Quay lại danh sách khóa học
      </Link>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Course Banner */}
      <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)',
            color: 'white',
            padding: '2.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-warning">{course.category}</span>
            {course.isPublished ? (
              <span className="badge badge-success">Đang mở ghi danh</span>
            ) : (
              <span className="badge badge-danger">Đã đóng</span>
            )}
            {isEnrolledStudent && (
              <span className="badge badge-primary" style={{ backgroundColor: '#22c55e', color: 'white' }}>
                <CheckCircle size={12} /> Đã ghi danh
              </span>
            )}
          </div>

          <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '1rem' }}>{course.title}</h1>
          <p style={{ color: 'var(--gray-200)', fontSize: '1rem', maxWidth: '800px', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {course.description || 'Chưa có mô tả cụ thể.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', display: 'block' }}>Giảng viên phụ trách</span>
              <strong>{course.teacher?.name} ({course.teacher?.email})</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', display: 'block' }}>Số lượng học viên</span>
              <strong>{course.studentCount || 0} học viên</strong>
            </div>

            {user?.role === 'student' && !course.isEnrolled && (
              <button
                onClick={handleEnroll}
                className="btn btn-success btn-lg"
                style={{ marginLeft: 'auto' }}
                disabled={enrolling}
              >
                {enrolling ? 'Đang xử lý...' : 'Ghi Danh Khóa Học Ngay'}
              </button>
            )}

            {isTeacherOrAdmin && (
              <Link
                to={`/teacher/courses/${course._id}`}
                className="btn btn-secondary"
                style={{ marginLeft: 'auto', backgroundColor: 'white', color: 'var(--primary)' }}
              >
                Quản lý nội dung & Bài tập
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          <BookOpen size={18} />
          <span>Tài Liệu Bài Học ({materials.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FileText size={18} />
          <span>Bài Tập Khóa Học ({assignments.length})</span>
        </button>

        {isTeacherOrAdmin && (
          <button
            className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={18} />
            <span>Danh Sách Học Viên ({students.length})</span>
          </button>
        )}
      </div>

      {/* Tab Content: Materials */}
      {activeTab === 'materials' && (
        <div>
          {!isEnrolledStudent && !isTeacherOrAdmin ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <BookOpen size={48} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
              <h3>Khóa học yêu cầu ghi danh</h3>
              <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Vui lòng nhấn nút <strong>Ghi danh khóa học</strong> phía trên để mở khóa toàn bộ tài liệu PDF, Video và Bài đọc.
              </p>
              {user?.role === 'student' && (
                <button onClick={handleEnroll} className="btn btn-primary" disabled={enrolling}>
                  Ghi Danh Miễn Phí
                </button>
              )}
            </div>
          ) : materials.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray-500)' }}>Giảng viên chưa đăng tải tài liệu nào cho khóa học này.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {materials.map((item) => (
                <div key={item._id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor:
                            item.type === 'pdf'
                              ? 'var(--danger-bg)'
                              : item.type === 'video'
                              ? 'var(--warning-bg)'
                              : 'var(--primary-light)',
                          color:
                            item.type === 'pdf'
                              ? 'var(--danger)'
                              : item.type === 'video'
                              ? '#b45309'
                              : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.type === 'pdf' ? (
                          <FileText size={22} />
                        ) : item.type === 'video' ? (
                          <Video size={22} />
                        ) : (
                          <BookOpen size={22} />
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h4 style={{ fontSize: '1.05rem' }}>{item.title}</h4>
                          <span
                            className={`badge ${
                              item.type === 'pdf'
                                ? 'badge-danger'
                                : item.type === 'video'
                                ? 'badge-warning'
                                : 'badge-primary'
                            }`}
                          >
                            {item.type.toUpperCase()}
                          </span>
                        </div>
                        {item.content && (
                          <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', whiteSpace: 'pre-line', marginTop: '0.5rem' }}>
                            {item.content}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions for Material */}
                    <div>
                      {item.type === 'pdf' && item.url && (
                        <a
                          href={item.url.startsWith('http') ? item.url : `http://localhost:5000${item.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-danger btn-sm"
                        >
                          <Download size={14} /> Tải PDF
                        </a>
                      )}
                      {item.type === 'video' && item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          <ExternalLink size={14} /> Xem Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Assignments */}
      {activeTab === 'assignments' && (
        <div>
          {!isEnrolledStudent && !isTeacherOrAdmin ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <FileText size={48} color="var(--gray-400)" style={{ margin: '0 auto 1rem' }} />
              <h3>Khóa học yêu cầu ghi danh</h3>
              <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                Vui lòng ghi danh vào khóa học để xem danh sách bài tập và nộp bài.
              </p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray-500)' }}>Hiện chưa có bài tập nào được giao trong lớp học này.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignments.map((assign) => (
                <div key={assign._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.15rem' }}>{assign.title}</h3>
                        <span className="badge badge-primary">Thang điểm: {assign.maxScore || 10}</span>
                      </div>

                      <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                        {assign.description || 'Không có hướng dẫn thêm.'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={14} /> Hạn nộp:{' '}
                          {assign.dueDate
                            ? new Date(assign.dueDate).toLocaleDateString('vi-VN')
                            : 'Không giới hạn'}
                        </span>

                        {isTeacherOrAdmin && (
                          <span>
                            Số bài đã nộp: <strong>{assign.submissionCount || 0}</strong> (Đã chấm: {assign.gradedCount || 0})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Student Status & Action */}
                    {user?.role === 'student' && (
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        {assign.isSubmitted ? (
                          <>
                            {assign.mySubmission?.score !== null && assign.mySubmission?.score !== undefined ? (
                              <div style={{ textAlign: 'right' }}>
                                <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}>
                                  <Award size={14} /> Điểm số: {assign.mySubmission.score} / {assign.maxScore}
                                </span>
                                {assign.mySubmission.feedback && (
                                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.25rem', maxWidth: '240px' }}>
                                    Nhận xét: "{assign.mySubmission.feedback}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="badge badge-warning">
                                <Clock size={12} /> Đã nộp - Chờ chấm điểm
                              </span>
                            )}
                            <Link to={`/student/submit/${assign._id}`} className="btn btn-secondary btn-sm">
                              Xem / Nộp lại bài
                            </Link>
                          </>
                        ) : (
                          <>
                            <span className="badge badge-danger">Chưa nộp</span>
                            <Link to={`/student/submit/${assign._id}`} className="btn btn-primary btn-sm">
                              Nộp bài tập ngay
                            </Link>
                          </>
                        )}
                      </div>
                    )}

                    {isTeacherOrAdmin && (
                      <div>
                        <Link to={`/teacher/courses/${course._id}`} className="btn btn-outline-primary btn-sm">
                          Quản lý & Chấm bài
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Enrolled Students */}
      {activeTab === 'students' && isTeacherOrAdmin && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Danh Sách Sinh Viên Đã Ghi Danh</h3>
          {students.length === 0 ? (
            <p style={{ color: 'var(--gray-500)' }}>Chưa có sinh viên nào ghi danh vào khóa học này.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và Tên</th>
                    <th>Địa chỉ Email</th>
                    <th>Ngày ghi danh</th>
                    <th>Trạng thái tài khoản</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((item, idx) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{item.student?.name}</strong>
                      </td>
                      <td>{item.student?.email}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        {item.student?.isActive ? (
                          <span className="badge badge-success">Hoạt động</span>
                        ) : (
                          <span className="badge badge-danger">Bị khóa</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;

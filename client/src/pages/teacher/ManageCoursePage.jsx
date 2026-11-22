import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/api';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Video,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Download,
  Award,
  Users,
  Calendar,
} from 'lucide-react';

const ManageCoursePage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('materials');
  const [loading, setLoading] = useState(true);

  // Material form state
  const [materialModal, setMaterialModal] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState('pdf');
  const [matUrl, setMatUrl] = useState('');
  const [matContent, setMatContent] = useState('');
  const [matFile, setMatFile] = useState(null);

  // Assignment form state
  const [assignModal, setAssignModal] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignMaxScore, setAssignMaxScore] = useState(10);

  // Grading state
  const [selectedAssignForGrading, setSelectedAssignForGrading] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeModal, setGradeModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const resCourse = await api.get(`/courses/${id}`);
      setCourse(resCourse.data);

      const resMat = await api.get(`/materials/course/${id}`);
      setMaterials(resMat.data);

      const resAssign = await api.get(`/assignments/course/${id}`);
      setAssignments(resAssign.data);

      const resStudents = await api.get(`/enrollments/course/${id}/students`);
      setStudents(resStudents.data);

      // Nếu có bài tập thì tự động chọn bài đầu tiên để xem nộp bài
      if (resAssign.data.length > 0 && !selectedAssignForGrading) {
        loadSubmissions(resAssign.data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Load submissions for a specific assignment
  const loadSubmissions = async (assignment) => {
    try {
      setSelectedAssignForGrading(assignment);
      const res = await api.get(`/submissions/assignment/${assignment._id}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add Material
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', matTitle);
      formData.append('type', matType);
      if (matType === 'reading') {
        formData.append('content', matContent);
      } else if (matType === 'video') {
        formData.append('url', matUrl);
      } else if (matType === 'pdf') {
        if (matFile) {
          formData.append('file', matFile);
        } else if (matUrl) {
          formData.append('url', matUrl);
        } else {
          return alert('Vui lòng chọn file PDF hoặc nhập link PDF');
        }
      }

      await api.post(`/materials/course/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Thêm tài liệu thành công!');
      setMaterialModal(false);
      setMatTitle('');
      setMatUrl('');
      setMatContent('');
      setMatFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thêm tài liệu');
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (matId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      try {
        await api.delete(`/materials/${matId}`);
        setMessage('Đã xóa tài liệu thành công');
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa tài liệu');
      }
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/assignments/course/${id}`, {
        title: assignTitle,
        description: assignDesc,
        dueDate: assignDueDate || null,
        maxScore: Number(assignMaxScore),
      });

      setMessage('Tạo bài tập mới thành công!');
      setAssignModal(false);
      setAssignTitle('');
      setAssignDesc('');
      setAssignDueDate('');
      setAssignMaxScore(10);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi tạo bài tập');
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (assignId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này cùng toàn bộ bài nộp liên quan?')) {
      try {
        await api.delete(`/assignments/${assignId}`);
        setMessage('Đã xóa bài tập thành công');
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa bài tập');
      }
    }
  };

  // Open Grade Modal
  const openGradeModal = (sub) => {
    setGradingSubmission(sub);
    setScoreInput(sub.score !== null && sub.score !== undefined ? sub.score : '');
    setFeedbackInput(sub.feedback || '');
    setGradeModal(true);
  };

  // Submit Grade
  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/submissions/${gradingSubmission._id}/grade`, {
        score: Number(scoreInput),
        feedback: feedbackInput,
      });

      setMessage('Chấm điểm bài nộp thành công!');
      setGradeModal(false);
      if (selectedAssignForGrading) {
        loadSubmissions(selectedAssignForGrading);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi chấm điểm');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-500)' }}>Đang tải thông tin quản lý khóa học...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <Link to="/teacher" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gray-600)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <ArrowLeft size={16} /> Quay lại danh sách lớp của tôi
      </Link>

      {message && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-warning">{course?.category}</span>
              {course?.isPublished ? (
                <span className="badge badge-success">Đang công khai</span>
              ) : (
                <span className="badge badge-danger">Đã ẩn</span>
              )}
            </div>
            <h1 style={{ fontSize: '1.75rem' }}>{course?.title}</h1>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {course?.description || 'Chưa có mô tả.'}
            </p>
          </div>

          <Link to={`/courses/${course?._id}`} className="btn btn-secondary btn-sm">
            <ExternalLink size={14} /> Xem dưới góc nhìn Sinh viên
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          <BookOpen size={18} />
          <span>Quản Lý Tài Liệu ({materials.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <FileText size={18} />
          <span>Quản Lý Bài Tập ({assignments.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <Award size={18} />
          <span>Chấm Điểm Bài Tập & Danh Sách Nộp</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={18} />
          <span>Danh Sách Sinh Viên ({students.length})</span>
        </button>
      </div>

      {/* TAB 1: MATERIALS */}
      {activeTab === 'materials' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Tài Liệu Đã Tải Lên</h2>
            <button onClick={() => setMaterialModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Đăng Tải Tài Liệu Mới
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>Chưa có tài liệu nào trong khóa học này.</p>
              <button onClick={() => setMaterialModal(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Thêm tài liệu đầu tiên
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {materials.map((m) => (
                <div key={m._id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor:
                          m.type === 'pdf' ? 'var(--danger-bg)' : m.type === 'video' ? 'var(--warning-bg)' : 'var(--primary-light)',
                        color:
                          m.type === 'pdf' ? 'var(--danger)' : m.type === 'video' ? '#b45309' : 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {m.type === 'pdf' ? <FileText size={20} /> : m.type === 'video' ? <Video size={20} /> : <BookOpen size={20} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1rem' }}>{m.title}</h4>
                        <span className="badge badge-gray">{m.type.toUpperCase()}</span>
                      </div>
                      {m.content && <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>{m.content.slice(0, 100)}...</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {m.url && (
                      <a
                        href={m.url.startsWith('http') ? m.url : `http://localhost:5000${m.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={14} /> Mở xem
                      </a>
                    )}
                    <button onClick={() => handleDeleteMaterial(m._id)} className="btn btn-outline-danger btn-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Danh Sách Bài Tập Cần Hoàn Thành</h2>
            <button onClick={() => setAssignModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> Tạo Bài Tập Mới
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>Chưa có bài tập nào được tạo.</p>
              <button onClick={() => setAssignModal(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Tạo bài tập đầu tiên
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignments.map((a) => (
                <div key={a._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <h3 style={{ fontSize: '1.15rem' }}>{a.title}</h3>
                        <span className="badge badge-primary">Thang điểm: {a.maxScore}</span>
                      </div>
                      <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                        {a.description || 'Không có mô tả.'}
                      </p>
                      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        <span>
                          <Calendar size={14} /> Hạn nộp:{' '}
                          {a.dueDate ? new Date(a.dueDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                        </span>
                        <span>Đã nộp: <strong>{a.submissionCount || 0}</strong> bài</span>
                        <span>Đã chấm: <strong>{a.gradedCount || 0}</strong> bài</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setActiveTab('submissions');
                          loadSubmissions(a);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        <Award size={14} /> Xem bài nộp & Chấm điểm
                      </button>
                      <button onClick={() => handleDeleteAssignment(a._id)} className="btn btn-outline-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBMISSIONS & GRADING */}
      {activeTab === 'submissions' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Chọn bài tập để xem và chấm bài:</label>
            <select
              className="form-select"
              value={selectedAssignForGrading?._id || ''}
              onChange={(e) => {
                const found = assignments.find((a) => a._id === e.target.value);
                if (found) loadSubmissions(found);
              }}
              style={{ maxWidth: '400px' }}
            >
              {assignments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.title} ({a.submissionCount || 0} bài nộp)
                </option>
              ))}
            </select>
          </div>

          {!selectedAssignForGrading ? (
            <p style={{ color: 'var(--gray-500)' }}>Vui lòng tạo bài tập trước khi chấm điểm.</p>
          ) : submissions.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray-500)' }}>Chưa có sinh viên nào nộp bài cho bài tập này.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Sinh viên</th>
                    <th>Nội dung bài nộp</th>
                    <th>File đính kèm</th>
                    <th>Ngày nộp</th>
                    <th>Điểm số</th>
                    <th>Nhận xét</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id}>
                      <td>
                        <strong>{sub.student?.name}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{sub.student?.email}</div>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>{sub.text || '(Không có text)'}</div>
                      </td>
                      <td>
                        {sub.fileUrl ? (
                          <a
                            href={`http://localhost:5000${sub.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary btn-sm"
                          >
                            <Download size={14} /> {sub.fileName || 'Tải file nộp'}
                          </a>
                        ) : (
                          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>Không có file</span>
                        )}
                      </td>
                      <td>{new Date(sub.createdAt).toLocaleString('vi-VN')}</td>
                      <td>
                        {sub.score !== null && sub.score !== undefined ? (
                          <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                            {sub.score} / {selectedAssignForGrading.maxScore}
                          </span>
                        ) : (
                          <span className="badge badge-warning">Chưa chấm</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.85rem' }}>
                        {sub.feedback || <span style={{ color: 'var(--gray-400)' }}>-</span>}
                      </td>
                      <td>
                        <button onClick={() => openGradeModal(sub)} className="btn btn-primary btn-sm">
                          <Award size={14} /> Chấm Điểm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STUDENTS */}
      {activeTab === 'students' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Danh Sách Sinh Viên Đã Ghi Danh ({students.length})
          </h3>
          {students.length === 0 ? (
            <p style={{ color: 'var(--gray-500)' }}>Chưa có sinh viên nào ghi danh vào khóa học này.</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Họ và tên</th>
                    <th>Email</th>
                    <th>Ngày ghi danh</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, idx) => (
                    <tr key={st._id}>
                      <td>{idx + 1}</td>
                      <td><strong>{st.student?.name}</strong></td>
                      <td>{st.student?.email}</td>
                      <td>{new Date(st.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        {st.student?.isActive ? (
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

      {/* Modal Add Material */}
      {materialModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Đăng Tải Tài Liệu Học Tập Mới</h3>
              <button onClick={() => setMaterialModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAddMaterial}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tiêu đề tài liệu *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: Slide Bài Giảng Tuần 1 - Tổng quan MERN Stack"
                    value={matTitle}
                    onChange={(e) => setMatTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loại tài liệu</label>
                  <select
                    className="form-select"
                    value={matType}
                    onChange={(e) => setMatType(e.target.value)}
                  >
                    <option value="pdf">Tài liệu PDF / File đính kèm</option>
                    <option value="video">Liên kết Video (YouTube, Vimeo...)</option>
                    <option value="reading">Bài đọc / Ghi chú lý thuyết</option>
                  </select>
                </div>

                {matType === 'pdf' && (
                  <div className="form-group">
                    <label className="form-label">Tải lên file PDF từ máy tính:</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.doc,.docx,.zip,.ppt,.pptx"
                      onChange={(e) => setMatFile(e.target.files[0])}
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                      Hoặc nhập đường dẫn PDF online bên dưới nếu không upload file:
                    </div>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/document.pdf"
                      value={matUrl}
                      onChange={(e) => setMatUrl(e.target.value)}
                      style={{ marginTop: '0.5rem' }}
                    />
                  </div>
                )}

                {matType === 'video' && (
                  <div className="form-group">
                    <label className="form-label">Đường dẫn liên kết Video (YouTube, Vimeo, Google Drive...) *</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={matUrl}
                      onChange={(e) => setMatUrl(e.target.value)}
                      required
                    />
                  </div>
                )}

                {matType === 'reading' && (
                  <div className="form-group">
                    <label className="form-label">Nội dung bài đọc / lý thuyết *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Nhập nội dung bài đọc, kiến thức cốt lõi..."
                      rows={6}
                      value={matContent}
                      onChange={(e) => setMatContent(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setMaterialModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Đăng Tải Tài Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Assignment */}
      {assignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Tạo Bài Tập Mới Cho Khóa Học</h3>
              <button onClick={() => setAssignModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateAssignment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tiêu đề bài tập *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="VD: Bài tập 1: Xây dựng RESTful API CRUD"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hướng dẫn yêu cầu bài tập</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Yêu cầu cụ thể, tiêu chí chấm điểm, link repo nộp..."
                    value={assignDesc}
                    onChange={(e) => setAssignDesc(e.target.value)}
                    rows={4}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hạn chót nộp bài (Due Date)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Điểm tối đa (Max Score)</label>
                    <input
                      type="number"
                      className="form-control"
                      min={1}
                      max={100}
                      value={assignMaxScore}
                      onChange={(e) => setAssignMaxScore(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setAssignModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo Bài Tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Grading */}
      {gradeModal && gradingSubmission && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem' }}>Chấm Điểm Bài Nộp</h3>
              <button onClick={() => setGradeModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleGradeSubmit}>
              <div className="modal-body">
                <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Sinh viên nộp:</div>
                  <strong>{gradingSubmission.student?.name}</strong> ({gradingSubmission.student?.email})
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>Nội dung bài làm:</div>
                  <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {gradingSubmission.text || '(Không có nội dung text)'}
                  </div>
                  {gradingSubmission.fileUrl && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <a
                        href={`http://localhost:5000${gradingSubmission.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <Download size={14} /> Xem file đính kèm: {gradingSubmission.fileName || 'file'}
                      </a>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Điểm số (Thang điểm 0 - {selectedAssignForGrading?.maxScore || 10}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={selectedAssignForGrading?.maxScore || 10}
                    className="form-control"
                    placeholder="VD: 9.5"
                    value={scoreInput}
                    onChange={(e) => setScoreInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nhận xét / Đánh giá của giảng viên</label>
                  <textarea
                    className="form-textarea"
                    placeholder="VD: Bài làm rất tốt, code sạch sẽ và hoàn thành đúng hạn..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setGradeModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu Kết Quả Chấm Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCoursePage;

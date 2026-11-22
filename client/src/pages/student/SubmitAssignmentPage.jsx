import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/api';
import {
  ArrowLeft,
  FileText,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  Download,
  Calendar,
} from 'lucide-react';

const SubmitAssignmentPage = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/assignments/${assignmentId}`);
      setAssignment(res.data);
      if (res.data.mySubmission) {
        setText(res.data.mySubmission.text || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin bài tập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !file && !assignment?.mySubmission?.fileUrl) {
      return setError('Vui lòng nhập nội dung bài làm hoặc tải lên file đính kèm');
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('text', text);
      if (file) {
        formData.append('file', file);
      }

      await api.post(`/submissions/${assignmentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Nộp bài tập thành công! Thông tin bài nộp đã được cập nhật.');
      fetchAssignment();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-500)' }}>Đang tải bài tập...</p>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const sub = assignment?.mySubmission;

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2.5rem 1.5rem' }}>
      <Link
        to={`/courses/${assignment?.course?._id || assignment?.course}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--gray-600)', marginBottom: '1.5rem', fontSize: '0.875rem' }}
      >
        <ArrowLeft size={16} /> Quay lại trang khóa học
      </Link>

      {message && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Assignment Details */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-primary">Khóa học: {assignment?.course?.title || 'Khóa học'}</span>
          <span className="badge badge-warning">Điểm tối đa: {assignment?.maxScore || 10}</span>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{assignment?.title}</h1>
        <p style={{ color: 'var(--gray-700)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '1.25rem' }}>
          {assignment?.description || 'Không có hướng dẫn cụ thể.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-500)', borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} /> Hạn chót:{' '}
            <strong>
              {assignment?.dueDate
                ? new Date(assignment.dueDate).toLocaleDateString('vi-VN')
                : 'Không giới hạn'}
            </strong>
          </span>
        </div>
      </div>

      {/* Score & Feedback Card (if graded) */}
      {sub && sub.score !== null && sub.score !== undefined && (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '2px solid var(--success)',
            backgroundColor: 'var(--success-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Award size={24} color="var(--success)" />
            <h3 style={{ color: '#065f46', fontSize: '1.25rem' }}>
              Kết Quả Chấm Điểm: {sub.score} / {assignment.maxScore} điểm
            </h3>
          </div>
          {sub.feedback && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#064e3b' }}>
              <strong>Nhận xét từ Giảng viên:</strong>
              <p style={{ marginTop: '0.25rem', fontStyle: 'italic', backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
                "{sub.feedback}"
              </p>
            </div>
          )}
          {sub.gradedAt && (
            <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.5rem' }}>
              Thời gian chấm: {new Date(sub.gradedAt).toLocaleString('vi-VN')}
            </div>
          )}
        </div>
      )}

      {/* Current Submission Info (if submitted) */}
      {sub && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: 'var(--gray-50)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="var(--success)" />
            <span>Bài Nộp Gần Nhất Của Bạn</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>
            Thời gian nộp: {new Date(sub.createdAt).toLocaleString('vi-VN')}
          </p>
          {sub.text && (
            <div style={{ marginBottom: '1rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
              {sub.text}
            </div>
          )}
          {sub.fileUrl && (
            <div>
              <a
                href={`http://localhost:5000${sub.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Download size={14} /> Tải file đã nộp ({sub.fileName || 'file'})
              </a>
            </div>
          )}
        </div>
      )}

      {/* Submission Form */}
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>
          {sub ? 'Nộp Lại Bài Tập' : 'Nộp Bài Tập'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Nội dung trả lời / Văn bản bài làm / Liên kết GitHub
            </label>
            <textarea
              className="form-textarea"
              placeholder="Nhập câu trả lời bằng văn bản hoặc paste link GitHub, Google Drive tại đây..."
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tải lên file bài tập (PDF, Word, Code, ZIP...)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file && (
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
                Đã chọn file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={submitting}
          >
            <UploadCloud size={18} />
            <span>{submitting ? 'Đang gửi bài...' : sub ? 'Cập Nhật Bài Nộp' : 'Xác Nhận Nộp Bài'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitAssignmentPage;

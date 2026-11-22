import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  AlertCircle,
  FolderTree,
  UserCheck,
  UserX,
  FileText,
  Award,
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter & search for users
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userSearch) params.search = userSearch;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/admin/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const reloadAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchCourses(), fetchCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userRoleFilter]);

  // Lock / Unlock user account
  const handleToggleUserStatus = async (user) => {
    try {
      const res = await api.put(`/admin/users/${user._id}/status`);
      setMessage(res.data.message);
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái tài khoản');
    }
  };

  // Change user role
  const handleChangeRole = async (userId, currentRole) => {
    const newRole = window.prompt(
      `Nhập vai trò mới cho người dùng (admin, teacher, student):`,
      currentRole
    );
    if (!newRole || !['admin', 'teacher', 'student'].includes(newRole.toLowerCase())) {
      if (newRole) alert('Vai trò không hợp lệ! Chỉ chấp nhận: admin, teacher, student');
      return;
    }
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole.toLowerCase() });
      setMessage('Cập nhật vai trò thành công!');
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật vai trò');
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (${user.email})? Thao tác này không thể hoàn tác.`)) {
      try {
        await api.delete(`/admin/users/${user._id}`);
        setMessage('Đã xóa tài khoản thành công!');
        fetchUsers();
        fetchStats();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa người dùng');
      }
    }
  };

  // Toggle Course publish
  const handleToggleCourse = async (course) => {
    try {
      const res = await api.put(`/admin/courses/${course._id}/status`);
      setMessage(res.data.message);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái khóa học');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (course) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.title}" trên toàn hệ thống?`)) {
      try {
        await api.delete(`/admin/courses/${course._id}`);
        setMessage('Đã xóa khóa học thành công!');
        fetchCourses();
        fetchStats();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa khóa học');
      }
    }
  };

  // Add category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName) return;
    try {
      await api.post('/admin/categories', { name: catName, description: catDesc });
      setMessage('Thêm danh mục thành công!');
      setCatName('');
      setCatDesc('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi thêm danh mục');
    }
  };

  // Delete category
  const handleDeleteCategory = async (catId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await api.delete(`/admin/categories/${catId}`);
        setMessage('Đã xóa danh mục thành công!');
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Lỗi khi xóa danh mục');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          <ShieldCheck size={18} />
          <span>BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN HỆ THỐNG</span>
        </div>
        <h1 style={{ fontSize: '2.25rem' }}>Quản Trị Hệ Thống Online Classroom</h1>
        <p style={{ color: 'var(--gray-600)' }}>
          Toàn quyền kiểm soát người dùng, phân quyền, quản lý khóa học và danh mục hệ thống.
        </p>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* System Statistics */}
      {stats && (
        <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                Tổng người dùng (GV: {stats.totalTeachers} | SV: {stats.totalStudents})
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalCourses}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Khóa học trên hệ thống</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: '#b45309' }}>
              <UserCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalEnrollments}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Lượt ghi danh học tập</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalAssignments}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                Bài tập ({stats.totalSubmissions} bài đã nộp)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          <span>Quản Lý Toàn Bộ Người Dùng ({users.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={18} />
          <span>Quản Lý Khóa Học Toàn Hệ Thống ({courses.length})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree size={18} />
          <span>Quản Lý Danh Mục Khóa Học ({categories.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div>
          {/* User Filter & Search */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-600)' }}>Lọc vai trò:</span>
              {['all', 'admin', 'teacher', 'student'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn btn-sm ${userRoleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUserRoleFilter(r)}
                >
                  {r === 'all' ? 'Tất cả' : r === 'admin' ? 'Quản trị' : r === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchUsers();
              }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Tìm tên hoặc email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ width: '220px' }}
              />
              <button type="submit" className="btn btn-secondary btn-sm">Tìm</button>
            </form>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái tài khoản</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác quản trị</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'admin'
                            ? 'badge-danger'
                            : u.role === 'teacher'
                            ? 'badge-warning'
                            : 'badge-primary'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} /> Đang hoạt động
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <Lock size={12} /> ĐÃ BỊ KHÓA
                        </span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {/* Nút Khóa / Mở khóa tài khoản */}
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-success'}`}
                          title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        >
                          {u.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                          <span>{u.isActive ? 'Khóa' : 'Mở khóa'}</span>
                        </button>

                        <button
                          onClick={() => handleChangeRole(u._id, u.role)}
                          className="btn btn-secondary btn-sm"
                          title="Đổi vai trò"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="btn btn-outline-danger btn-sm"
                          title="Xóa tài khoản vĩnh viễn"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tên Khóa Học</th>
                <th>Giảng Viên</th>
                <th>Danh Mục</th>
                <th>Số Học Viên</th>
                <th>Trạng Thái</th>
                <th>Ngày Tạo</th>
                <th>Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.title}</strong></td>
                  <td>{c.teacher?.name || 'N/A'}</td>
                  <td><span className="badge badge-warning">{c.category}</span></td>
                  <td>{c.studentCount || 0}</td>
                  <td>
                    {c.isPublished ? (
                      <span className="badge badge-success">Công khai</span>
                    ) : (
                      <span className="badge badge-danger">Đã ẩn</span>
                    )}
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleToggleCourse(c)}
                        className={`btn btn-sm ${c.isPublished ? 'btn-secondary' : 'btn-success'}`}
                      >
                        {c.isPublished ? 'Ẩn khóa học' : 'Hiện công khai'}
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c)}
                        className="btn btn-outline-danger btn-sm"
                        title="Xóa khóa học khỏi hệ thống"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Add Category Form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Thêm Danh Mục Mới
            </h3>
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label className="form-label">Tên danh mục *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="VD: Trí tuệ Nhân tạo (AI)"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả danh mục</label>
                <textarea
                  className="form-textarea"
                  placeholder="Mô tả các lĩnh vực thuộc danh mục này..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Thêm Danh Mục
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Danh Sách Các Danh Mục Hiện Có ({categories.length})
            </h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tên Danh Mục</th>
                    <th>Mô Tả</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td><strong>{cat.name}</strong></td>
                      <td style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>{cat.description || '-'}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

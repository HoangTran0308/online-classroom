import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  GraduationCap,
  LogOut,
  User,
  ShieldCheck,
  FolderKanban,
  LayoutDashboard,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-danger">Quản Trị Viên</span>;
      case 'teacher':
        return <span className="badge badge-warning">Giảng Viên</span>;
      case 'student':
        return <span className="badge badge-primary">Sinh Viên</span>;
      default:
        return null;
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <GraduationCap size={28} />
          <span>OnlineClass</span>
        </Link>

        <ul className="navbar-nav">
          <li>
            <Link to="/" className="nav-link">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link to="/courses" className="nav-link">
              <BookOpen size={16} />
              Khóa học
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              {user.role === 'student' && (
                <li>
                  <Link to="/student" className="nav-link">
                    <LayoutDashboard size={16} />
                    Lớp của tôi
                  </Link>
                </li>
              )}

              {user.role === 'teacher' && (
                <li>
                  <Link to="/teacher" className="nav-link">
                    <FolderKanban size={16} />
                    Quản lý lớp học
                  </Link>
                </li>
              )}

              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className="nav-link">
                    <ShieldCheck size={16} />
                    Quản trị hệ thống
                  </Link>
                </li>
              )}

              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 600 }}>{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Đăng xuất"
                >
                  <LogOut size={14} />
                  <span>Đăng xuất</span>
                </button>
              </li>
            </>
          ) : (
            <li style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Đăng ký
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

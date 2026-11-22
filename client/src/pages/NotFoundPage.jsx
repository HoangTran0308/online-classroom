import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Không tìm thấy trang yêu cầu</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={16} /> Quay về Trang Chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;

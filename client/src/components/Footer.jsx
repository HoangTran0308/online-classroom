import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'white', borderTop: '1px solid var(--gray-200)', padding: '2rem 0', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
          <GraduationCap size={22} />
          <span>Hệ Thống Lớp Học Trực Tuyến - Online Classroom</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', maxWidth: '600px' }}>
          Đề án Tiểu Luận Cuối Kỳ môn Lập trình Web - Công nghệ MERN Stack (MongoDB, Express.js, React.js, Node.js).
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>
          © {new Date().getFullYear()} Online Classroom Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

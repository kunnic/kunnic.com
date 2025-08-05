// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    // bg-white: nền trắng, text-gray-800: màu chữ xám đậm
    <div className="bg-white text-gray-800 font-sans">
      {/* max-w-5xl: chiều rộng tối đa, mx-auto: căn giữa, px-4/sm:px-6/lg:px-8: padding ngang thay đổi theo kích thước màn hình */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />
        <main className="py-8 sm:py-12"> {/* py: padding dọc */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
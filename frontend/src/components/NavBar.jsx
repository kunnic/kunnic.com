// frontend/src/components/Navbar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? 'text-gray-900 font-semibold border-b-2 border-gray-900'
      : 'text-gray-500 hover:text-gray-900 transition-colors';
  };

  return (
    // py-4: giảm padding dọc trên mobile, sm:py-6: tăng lại trên màn hình lớn hơn
    <header className="flex flex-col sm:flex-row justify-between items-center py-4 sm:py-6 border-b border-gray-200">
      {/* mb-4: thêm margin-bottom trên mobile, sm:mb-0: bỏ margin trên màn hình lớn */}
      <NavLink to="/" className="text-2xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-0">
        [kunnic]
      </NavLink>
      {/* text-base: giảm cỡ chữ trên mobile, sm:text-lg: tăng lại trên màn hình lớn */}
      <nav className="flex gap-6 sm:gap-8 text-base sm:text-lg">
        <NavLink to="/" className={getNavLinkClass}>
          Suy Tưởng
        </NavLink>
        <NavLink to="/music" className={getNavLinkClass}>
          Âm Nhạc
        </NavLink>
        <NavLink to="/gallery" className={getNavLinkClass}>
          Thần Tượng
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
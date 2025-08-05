// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Desktop Area - Blank */}
      <main className="h-screen">
        <Outlet />
      </main>
      
      {/* Navbar - Bottom taskbar */}
      <Navbar />
    </div>
  );
}

export default Layout;

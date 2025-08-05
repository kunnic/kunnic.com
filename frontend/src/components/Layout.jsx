// frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import TestWindow from './Window/TestWindow';
import BlogWindow from './Window/BlogWindow';
import MusicWindow from './Window/MusicWindow';

function Layout() {
  const [showTestWindow, setShowTestWindow] = useState(false);
  const [showBlogWindow, setShowBlogWindow] = useState(false);
  const [showMusicWindow, setShowMusicWindow] = useState(false);
  const [testWindowMinimized, setTestWindowMinimized] = useState(false);
  const [blogWindowMinimized, setBlogWindowMinimized] = useState(false);
  const [musicWindowMinimized, setMusicWindowMinimized] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState(null);
  const [windowZIndex, setWindowZIndex] = useState(40); // Base z-index for windows

  const toggleTestWindow = () => {
    if (!showTestWindow) {
      // Open the window
      setShowTestWindow(true);
      setTestWindowMinimized(false);
      bringWindowToFront('test');
    } else if (focusedWindow === 'test' && !testWindowMinimized) {
      // If window is focused and visible, minimize it
      setTestWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is minimized or not focused, restore and focus it
      setTestWindowMinimized(false);
      bringWindowToFront('test');
    }
  };

  const closeTestWindow = () => {
    setShowTestWindow(false);
    setTestWindowMinimized(false);
    if (focusedWindow === 'test') {
      setFocusedWindow(null);
    }
  };

  const toggleBlogWindow = () => {
    if (!showBlogWindow) {
      // Open the window
      setShowBlogWindow(true);
      setBlogWindowMinimized(false);
      bringWindowToFront('blog');
    } else if (focusedWindow === 'blog' && !blogWindowMinimized) {
      // If window is focused and visible, minimize it
      setBlogWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is minimized or not focused, restore and focus it
      setBlogWindowMinimized(false);
      bringWindowToFront('blog');
    }
  };

  const closeBlogWindow = () => {
    setShowBlogWindow(false);
    setBlogWindowMinimized(false);
    if (focusedWindow === 'blog') {
      setFocusedWindow(null);
    }
  };

  const toggleMusicWindow = () => {
    if (!showMusicWindow) {
      // Open the window
      setShowMusicWindow(true);
      setMusicWindowMinimized(false);
      bringWindowToFront('music');
    } else if (focusedWindow === 'music' && !musicWindowMinimized) {
      // If window is focused and visible, minimize it
      setMusicWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is minimized or not focused, restore and focus it
      setMusicWindowMinimized(false);
      bringWindowToFront('music');
    }
  };

  const closeMusicWindow = () => {
    setShowMusicWindow(false);
    setMusicWindowMinimized(false);
    if (focusedWindow === 'music') {
      setFocusedWindow(null);
    }
  };

  const bringWindowToFront = (windowId) => {
    setFocusedWindow(windowId);
    setWindowZIndex(prev => prev + 1);
  };

  // Calculate z-index for each window
  const getWindowZIndex = (windowId) => {
    if (focusedWindow === windowId) {
      return windowZIndex;
    }
    return 40; // Base z-index for unfocused windows
  };

  // Get window state for taskbar button styling
  const getWindowState = (windowId) => {
    if (windowId === 'test') {
      return {
        isOpen: showTestWindow,
        isMinimized: testWindowMinimized,
        isFocused: focusedWindow === 'test'
      };
    } else if (windowId === 'blog') {
      return {
        isOpen: showBlogWindow,
        isMinimized: blogWindowMinimized,
        isFocused: focusedWindow === 'blog'
      };
    } else if (windowId === 'music') {
      return {
        isOpen: showMusicWindow,
        isMinimized: musicWindowMinimized,
        isFocused: focusedWindow === 'music'
      };
    }
    return { isOpen: false, isMinimized: false, isFocused: false };
  };

  return (
    // bg-white: nền trắng, text-gray-800: màu chữ xám đậm, min-h-screen: chiều cao tối thiểu full screen
    <div className="bg-white text-gray-800 font-sans min-h-screen flex flex-col">
      {/* max-w-5xl: chiều rộng tối đa, mx-auto: căn giữa, px-4/sm:px-6/lg:px-8: padding ngang thay đổi theo kích thước màn hình */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <main className="py-8 sm:py-12 flex-1 pb-20"> {/* pb-20: reduced padding bottom for new taskbar height */}
          <Outlet />
        </main>
        <Navbar 
          onToggleTestWindow={toggleTestWindow} 
          onToggleBlogWindow={toggleBlogWindow}
          onToggleMusicWindow={toggleMusicWindow}
          getWindowState={getWindowState}
        />
      </div>
      
      {/* Windows */}
      {showTestWindow && !testWindowMinimized && (
        <TestWindow 
          onClose={closeTestWindow} 
          onFocus={() => bringWindowToFront('test')}
          onMinimize={() => setTestWindowMinimized(true)}
          zIndex={getWindowZIndex('test')}
        />
      )}
      {showBlogWindow && !blogWindowMinimized && (
        <BlogWindow 
          onClose={closeBlogWindow}
          onFocus={() => bringWindowToFront('blog')}
          onMinimize={() => setBlogWindowMinimized(true)}
          zIndex={getWindowZIndex('blog')}
        />
      )}
      {showMusicWindow && !musicWindowMinimized && (
        <MusicWindow 
          onClose={closeMusicWindow}
          onFocus={() => bringWindowToFront('music')}
          onMinimize={() => setMusicWindowMinimized(true)}
          zIndex={getWindowZIndex('music')}
        />
      )}
    </div>
  );
}

export default Layout;
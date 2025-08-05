// frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import BlogWindow from './Window/BlogWindow';
import MusicWindow from './Window/MusicWindow';
import GalleryWindow from './Window/GalleryWindow';

function Layout() {
  const [showBlogWindow, setShowBlogWindow] = useState(false);
  const [showMusicWindow, setShowMusicWindow] = useState(false);
  const [showGalleryWindow, setShowGalleryWindow] = useState(false);
  const [blogWindowMinimized, setBlogWindowMinimized] = useState(false);
  const [musicWindowMinimized, setMusicWindowMinimized] = useState(false);
  const [galleryWindowMinimized, setGalleryWindowMinimized] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState(null);

  const toggleBlogWindow = () => {
    if (!showBlogWindow) {
      // Open the window
      setShowBlogWindow(true);
      setBlogWindowMinimized(false);
      setFocusedWindow('blog');
    } else if (!blogWindowMinimized) {
      // If window is visible, minimize it
      setBlogWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is minimized, restore it
      setBlogWindowMinimized(false);
      setFocusedWindow('blog');
    }
  };

  // Helper function to find and focus the topmost open window after an action
  const focusTopWindow = (excludeWindow = null) => {
    // Define priority order for windows (can be customized)
    const windowPriority = ['blog', 'music', 'gallery'];
    
    // Find the highest priority open and visible window (excluding the specified window)
    for (const windowId of windowPriority) {
      if (windowId === excludeWindow) continue; // Skip the window being closed/minimized
      
      if (windowId === 'blog' && showBlogWindow && !blogWindowMinimized) {
        setFocusedWindow('blog');
        return;
      }
      if (windowId === 'music' && showMusicWindow && !musicWindowMinimized) {
        setFocusedWindow('music');
        return;
      }
      if (windowId === 'gallery' && showGalleryWindow && !galleryWindowMinimized) {
        setFocusedWindow('gallery');
        return;
      }
    }
    
    // If no windows are open, clear focus
    setFocusedWindow(null);
  };

  // Get window z-index based on focus - focused window gets highest z-index
  const getWindowZIndex = (windowId) => {
    if (focusedWindow === windowId) {
      return 50; // Highest z-index for focused window
    }
    return 40; // Lower z-index for unfocused windows
  };

  const closeBlogWindow = () => {
    setShowBlogWindow(false);
    setBlogWindowMinimized(false);
    // Always refocus to the next highest priority window (excluding blog)
    focusTopWindow('blog');
  };

  const toggleMusicWindow = () => {
    if (!showMusicWindow) {
      // Open the window
      setShowMusicWindow(true);
      setMusicWindowMinimized(false);
      setFocusedWindow('music');
    } else if (!musicWindowMinimized) {
      // If window is visible, minimize it
      setMusicWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is minimized, restore it
      setMusicWindowMinimized(false);
      setFocusedWindow('music');
    }
  };

  const closeMusicWindow = () => {
    setShowMusicWindow(false);
    setMusicWindowMinimized(false);
    // Always refocus to the next highest priority window (excluding music)
    focusTopWindow('music');
  };

  const toggleGalleryWindow = () => {
    if (!showGalleryWindow) {
      // Open the window
      setShowGalleryWindow(true);
      setGalleryWindowMinimized(false);
      setFocusedWindow('gallery');
    } else if (!galleryWindowMinimized) {
      // If window is visible, minimize it
      setGalleryWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is minimized, restore it
      setGalleryWindowMinimized(false);
      setFocusedWindow('gallery');
    }
  };

  const closeGalleryWindow = () => {
    setShowGalleryWindow(false);
    setGalleryWindowMinimized(false);
    // Always refocus to the next highest priority window (excluding gallery)
    focusTopWindow('gallery');
  };

  // Simple focus function
  const focusWindow = (windowId) => {
    setFocusedWindow(windowId);
  };

  // Get window state for taskbar button styling
  const getWindowState = (windowId) => {
    if (windowId === 'blog') {
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
    } else if (windowId === 'gallery') {
      return {
        isOpen: showGalleryWindow,
        isMinimized: galleryWindowMinimized,
        isFocused: focusedWindow === 'gallery'
      };
    }
    return { isOpen: false, isMinimized: false, isFocused: false };
  };

  return (
    // Desktop interface with taskbar
    <div className="min-h-screen h-screen flex flex-col relative bg-white">
      {/* Desktop Area */}
      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>
      
      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0">
        <Navbar 
          onToggleBlogWindow={toggleBlogWindow}
          onToggleMusicWindow={toggleMusicWindow}
          onToggleGalleryWindow={toggleGalleryWindow}
          getWindowState={getWindowState}
        />
      </div>
      
      {/* Windows */}
      {showBlogWindow && (
        <BlogWindow 
          onClose={closeBlogWindow}
          onFocus={() => focusWindow('blog')}
          onMinimize={() => {
            setBlogWindowMinimized(true);
            if (focusedWindow === 'blog') {
              focusTopWindow('blog');
            }
          }}
          zIndex={getWindowZIndex('blog')}
          isMinimized={blogWindowMinimized}
        />
      )}
      {showMusicWindow && (
        <MusicWindow 
          onClose={closeMusicWindow}
          onFocus={() => focusWindow('music')}
          onMinimize={() => {
            setMusicWindowMinimized(true);
            if (focusedWindow === 'music') {
              focusTopWindow('music');
            }
          }}
          zIndex={getWindowZIndex('music')}
          isMinimized={musicWindowMinimized}
        />
      )}
      {showGalleryWindow && (
        <GalleryWindow 
          onClose={closeGalleryWindow}
          onFocus={() => focusWindow('gallery')}
          onMinimize={() => {
            setGalleryWindowMinimized(true);
            if (focusedWindow === 'gallery') {
              focusTopWindow('gallery');
            }
          }}
          zIndex={getWindowZIndex('gallery')}
          isMinimized={galleryWindowMinimized}
        />
      )}
    </div>
  );
}

export default Layout;
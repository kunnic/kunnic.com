// frontend/src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import BlogWindow from './Window/BlogWindow';
import MusicWindow from './Window/MusicWindow';
import GalleryWindow from './Window/GalleryWindow';
import InfoWindow from './Window/InfoWindow';

function Layout() {
  const [showBlogWindow, setShowBlogWindow] = useState(false);
  const [showMusicWindow, setShowMusicWindow] = useState(false);
  const [showGalleryWindow, setShowGalleryWindow] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [blogWindowMinimized, setBlogWindowMinimized] = useState(false);
  const [musicWindowMinimized, setMusicWindowMinimized] = useState(false);
  const [galleryWindowMinimized, setGalleryWindowMinimized] = useState(false);
  const [infoWindowMinimized, setInfoWindowMinimized] = useState(false);
  const [focusedWindow, setFocusedWindow] = useState(null);
  const [windowStack, setWindowStack] = useState([]); // Stack order for proper layering

  // Global right-click and selection prevention
  useEffect(() => {
    // Disable right-click context menu globally
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection with mouse events
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable drag start on images and other elements
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const toggleBlogWindow = () => {
    if (!showBlogWindow) {
      // Open the window
      setShowBlogWindow(true);
      setBlogWindowMinimized(false);
      focusWindow('blog');
    } else if (blogWindowMinimized) {
      // If window is minimized, restore and focus it
      setBlogWindowMinimized(false);
      focusWindow('blog');
    } else if (focusedWindow === 'blog') {
      // If window is focused, minimize it
      setBlogWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is open but not focused, focus it
      focusWindow('blog');
    }
  };

  // Helper function to find and focus the topmost open window after an action
  const focusTopWindow = (excludeWindow = null) => {
    // Define priority order for windows (can be customized)
    const windowPriority = ['blog', 'music', 'gallery', 'info'];
    
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
      if (windowId === 'info' && showInfoWindow && !infoWindowMinimized) {
        setFocusedWindow('info');
        return;
      }
    }
    
    // If no windows are open, clear focus
    setFocusedWindow(null);
  };

  // Get window z-index based on stack position - proper layering
  const getWindowZIndex = (windowId) => {
    const baseZIndex = 40;
    const stackIndex = windowStack.indexOf(windowId);
    if (stackIndex === -1) {
      // Window not in stack yet, add it
      setWindowStack(prev => [...prev, windowId]);
      return baseZIndex + windowStack.length;
    }
    return baseZIndex + stackIndex;
  };

  const closeBlogWindow = () => {
    setShowBlogWindow(false);
    setBlogWindowMinimized(false);
    // Remove from window stack
    setWindowStack(prev => prev.filter(id => id !== 'blog'));
    // Clear focus if the closed window was focused, then find next window
    if (focusedWindow === 'blog') {
      setFocusedWindow(null);
      // Use setTimeout to ensure state updates are applied before focusing next window
      setTimeout(() => focusTopWindow('blog'), 0);
    }
  };

  const toggleMusicWindow = () => {
    if (!showMusicWindow) {
      // Open the window
      setShowMusicWindow(true);
      setMusicWindowMinimized(false);
      focusWindow('music');
    } else if (musicWindowMinimized) {
      // If window is minimized, restore and focus it
      setMusicWindowMinimized(false);
      focusWindow('music');
    } else if (focusedWindow === 'music') {
      // If window is focused, minimize it
      setMusicWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is open but not focused, focus it
      focusWindow('music');
    }
  };

  const closeMusicWindow = () => {
    setShowMusicWindow(false);
    setMusicWindowMinimized(false);
    // Remove from window stack
    setWindowStack(prev => prev.filter(id => id !== 'music'));
    // Clear focus if the closed window was focused, then find next window
    if (focusedWindow === 'music') {
      setFocusedWindow(null);
      // Use setTimeout to ensure state updates are applied before focusing next window
      setTimeout(() => focusTopWindow('music'), 0);
    }
  };

  const toggleGalleryWindow = () => {
    if (!showGalleryWindow) {
      // Open the window
      setShowGalleryWindow(true);
      setGalleryWindowMinimized(false);
      focusWindow('gallery');
    } else if (galleryWindowMinimized) {
      // If window is minimized, restore and focus it
      setGalleryWindowMinimized(false);
      focusWindow('gallery');
    } else if (focusedWindow === 'gallery') {
      // If window is focused, minimize it
      setGalleryWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is open but not focused, focus it
      focusWindow('gallery');
    }
  };

  const closeGalleryWindow = () => {
    setShowGalleryWindow(false);
    setGalleryWindowMinimized(false);
    // Remove from window stack
    setWindowStack(prev => prev.filter(id => id !== 'gallery'));
    // Clear focus if the closed window was focused, then find next window
    if (focusedWindow === 'gallery') {
      setFocusedWindow(null);
      // Use setTimeout to ensure state updates are applied before focusing next window
      setTimeout(() => focusTopWindow('gallery'), 0);
    }
  };

  const toggleInfoWindow = () => {
    if (!showInfoWindow) {
      // Open the window
      setShowInfoWindow(true);
      setInfoWindowMinimized(false);
      focusWindow('info');
    } else if (infoWindowMinimized) {
      // If window is minimized, restore and focus it
      setInfoWindowMinimized(false);
      focusWindow('info');
    } else if (focusedWindow === 'info') {
      // If window is focused, minimize it
      setInfoWindowMinimized(true);
      setFocusedWindow(null);
    } else {
      // If window is open but not focused, focus it
      focusWindow('info');
    }
  };

  const closeInfoWindow = () => {
    setShowInfoWindow(false);
    setInfoWindowMinimized(false);
    // Remove from window stack
    setWindowStack(prev => prev.filter(id => id !== 'info'));
    // Clear focus if the closed window was focused, then find next window
    if (focusedWindow === 'info') {
      setFocusedWindow(null);
      // Use setTimeout to ensure state updates are applied before focusing next window
      setTimeout(() => focusTopWindow('info'), 0);
    }
  };

  // Simple focus function with proper stacking
  const focusWindow = (windowId) => {
    setFocusedWindow(windowId);
    // Update window stack order - move focused window to top
    setWindowStack(prev => {
      // Remove the window from its current position and add it to the end (top)
      const newStack = prev.filter(id => id !== windowId);
      return [...newStack, windowId];
    });
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
    } else if (windowId === 'info') {
      return {
        isOpen: showInfoWindow,
        isMinimized: infoWindowMinimized,
        isFocused: focusedWindow === 'info'
      };
    }
    return { isOpen: false, isMinimized: false, isFocused: false };
  };

  return (
    // Desktop interface with taskbar - disable context menu and text selection
    <div 
      className="min-h-screen h-screen flex flex-col relative bg-white select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Desktop Area */}
      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>
      
      {/* Windows Activation Watermark */}
      <div className="absolute bottom-24 right-6 pointer-events-none select-none z-50">
        <div className="text-lg text-white/50 font-light leading-tight px-4 py-2 text-left">
          Made with ❤️ by kunnic<br />
          <span className="text-sm text-white/50">Go to Info for more details (´▽`ʃ♡ƪ)</span>
        </div>
      </div>
      
      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0">
        <Navbar 
          onToggleBlogWindow={toggleBlogWindow}
          onToggleMusicWindow={toggleMusicWindow}
          onToggleGalleryWindow={toggleGalleryWindow}
          onToggleInfoWindow={toggleInfoWindow}
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
              setFocusedWindow(null);
              // Use setTimeout to ensure state updates are applied before focusing next window
              setTimeout(() => focusTopWindow('blog'), 0);
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
              setFocusedWindow(null);
              // Use setTimeout to ensure state updates are applied before focusing next window
              setTimeout(() => focusTopWindow('music'), 0);
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
              setFocusedWindow(null);
              // Use setTimeout to ensure state updates are applied before focusing next window
              setTimeout(() => focusTopWindow('gallery'), 0);
            }
          }}
          zIndex={getWindowZIndex('gallery')}
          isMinimized={galleryWindowMinimized}
        />
      )}
      {showInfoWindow && (
        <InfoWindow 
          onClose={closeInfoWindow}
          onFocus={() => focusWindow('info')}
          onMinimize={() => {
            setInfoWindowMinimized(true);
            if (focusedWindow === 'info') {
              setFocusedWindow(null);
              // Use setTimeout to ensure state updates are applied before focusing next window
              setTimeout(() => focusTopWindow('info'), 0);
            }
          }}
          zIndex={getWindowZIndex('info')}
          isMinimized={infoWindowMinimized}
        />
      )}
    </div>
  );
}

export default Layout;
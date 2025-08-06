// frontend/src/components/Navbar.jsx

import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import Clock from './Clock';
import { useLanguage } from '../i18n';

function Navbar({ onToggleBlogWindow, onToggleMusicWindow, onToggleGalleryWindow, onToggleInfoWindow, getWindowState }) {
  const { t } = useLanguage();
  const [hoveredButton, setHoveredButton] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const blogWindowState = getWindowState('blog');
  const musicWindowState = getWindowState('music');
  const galleryWindowState = getWindowState('gallery');
  const infoWindowState = getWindowState('info');

  const handleMouseEnter = (buttonName, event) => {
    setHoveredButton(buttonName);
    const rect = event.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoveredButton(null);
  };
  
  return (
    <>
      {/* Custom Tooltip */}
      {hoveredButton && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y - 40}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
            {hoveredButton}
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"
            />
          </div>
        </div>
      )}
    
      {/* Fixed positioning at bottom, full width, with background and shadow - disable context menu and text selection */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-300 shadow-2xl z-50 select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
      <div className="w-full px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center py-2">
          {/* Start button / Brand logo - Far Left */}
          <div className="flex-1">
            <NavLink 
              to="/" 
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm w-fit"
            >
              <span className="mr-2">⊞</span>
              {t('nav.start')}
            </NavLink>
          </div>
          
          {/* Taskbar buttons - Absolute Center */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex gap-2">
            <button
              onClick={onToggleMusicWindow}
              onMouseEnter={(e) => handleMouseEnter('Music Player', e)}
              onMouseLeave={handleMouseLeave}
              className={`flex items-center justify-center p-2 rounded-lg border w-12 h-12 transition-all duration-200 ${
                musicWindowState.isFocused
                  ? 'bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200 hover:border-blue-500'
                  : musicWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                  : 'text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M210.3,56.34l-80-24A8,8,0,0,0,120,40V148.26A36,36,0,1,0,136,184V50.75l69.7,20.91A8,8,0,0,0,210.3,56.34ZM104,200a20,20,0,1,1,20-20A20,20,0,0,1,104,200Z"/>
              </svg>
            </button>
            
            {/* Gallery Window Button */}
            <button
              onClick={onToggleGalleryWindow}
              onMouseEnter={(e) => handleMouseEnter('Gallery', e)}
              onMouseLeave={handleMouseLeave}
              className={`flex items-center justify-center p-2 rounded-lg border w-12 h-12 transition-all duration-200 ${
                galleryWindowState.isFocused
                  ? 'bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200 hover:border-blue-500'
                  : galleryWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                  : 'text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216v62.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,109.37ZM216,200H40V129.37l40.68-40.68,55.32,55.32a8,8,0,0,0,11.32,0L168,123.31,216,171.31V200ZM144,96a16,16,0,1,1,16,16A16,16,0,0,1,144,96Z"/>
              </svg>
            </button>
            
            {/* Blog Window Button */}
            <button
              onClick={onToggleBlogWindow}
              onMouseEnter={(e) => handleMouseEnter('Blog', e)}
              onMouseLeave={handleMouseLeave}
              className={`flex items-center justify-center p-2 rounded-lg border w-12 h-12 transition-all duration-200 ${
                blogWindowState.isFocused
                  ? 'bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200 hover:border-blue-500'
                  : blogWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                  : 'text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V176H40ZM64,88a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,88Zm0,32a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,120Zm0,32a8,8,0,0,1,8-8h80a8,8,0,0,1,0,16H72A8,8,0,0,1,64,152Z"/>
              </svg>
            </button>

            {/* Info Window Button */}
            <button
              onClick={onToggleInfoWindow}
              onMouseEnter={(e) => handleMouseEnter('Portfolio Info', e)}
              onMouseLeave={handleMouseLeave}
              className={`flex items-center justify-center p-2 rounded-lg border w-12 h-12 transition-all duration-200 ${
                infoWindowState.isFocused
                  ? 'bg-blue-100 text-blue-700 border-blue-400 hover:bg-blue-200 hover:border-blue-500'
                  : infoWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'
                  : 'text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
              </svg>
            </button>
          </div>
          
          {/* System tray area with language switcher and time - Far Right */}
          <div className="flex-1 flex items-center justify-end gap-3 text-gray-500">
            <LanguageSwitcher />
            <Clock />
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}

export default Navbar;
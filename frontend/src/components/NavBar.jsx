// frontend/src/components/Navbar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../i18n';

function Navbar({ onToggleBlogWindow, onToggleMusicWindow, onToggleGalleryWindow, getWindowState }) {
  const { t } = useLanguage();
  
  const blogWindowState = getWindowState('blog');
  const musicWindowState = getWindowState('music');
  const galleryWindowState = getWindowState('gallery');
  
  return (
    // Fixed positioning at bottom, full width, with background and shadow
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-300 shadow-2xl z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          {/* Start button / Brand logo */}
          <NavLink 
            to="/" 
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm"
          >
            <span className="mr-2">⊞</span>
            {t('nav.start')}
          </NavLink>
          
          {/* Taskbar buttons */}
          <div className="flex gap-2">
            <button
              onClick={onToggleMusicWindow}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border min-w-[60px] max-w-[80px] ${
                musicWindowState.isFocused
                  ? 'bg-blue-100 text-blue-700 border-blue-400'
                  : musicWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                  : 'text-gray-600 border-transparent'
              }`}
              title="Toggle Music Player"
            >
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M210.3,56.34l-80-24A8,8,0,0,0,120,40V148.26A36,36,0,1,0,136,184V50.75l69.7,20.91A8,8,0,0,0,210.3,56.34ZM104,200a20,20,0,1,1,20-20A20,20,0,0,1,104,200Z"/>
                </svg>
              </div>
              <span className="text-xs font-medium leading-tight">Music</span>
            </button>
            
            {/* Gallery Window Button */}
            <button
              onClick={onToggleGalleryWindow}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border min-w-[60px] max-w-[80px] ${
                galleryWindowState.isFocused
                  ? 'bg-blue-100 text-blue-700 border-blue-400'
                  : galleryWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                  : 'text-gray-600 border-transparent'
              }`}
              title="Toggle Gallery Window"
            >
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216v62.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,109.37ZM216,200H40V129.37l40.68-40.68,55.32,55.32a8,8,0,0,0,11.32,0L168,123.31,216,171.31V200ZM144,96a16,16,0,1,1,16,16A16,16,0,0,1,144,96Z"/>
                </svg>
              </div>
              <span className="text-xs font-medium leading-tight">Gallery</span>
            </button>
            
            {/* Blog Window Button */}
            <button
              onClick={onToggleBlogWindow}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg border min-w-[60px] max-w-[80px] ${
                blogWindowState.isFocused
                  ? 'bg-blue-100 text-blue-700 border-blue-400'
                  : blogWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border-gray-300'
                  : 'text-gray-600 border-transparent'
              }`}
              title="Toggle Blog Window"
            >
              <div className="w-5 h-5 mb-1 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V176H40ZM64,88a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,88Zm0,32a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,120Zm0,32a8,8,0,0,1,8-8h80a8,8,0,0,1,0,16H72A8,8,0,0,1,64,152Z"/>
                </svg>
              </div>
              <span className="text-xs font-medium leading-tight">Blog</span>
            </button>
          </div>
          
          {/* System tray area with language switcher and time */}
          <div className="flex items-center gap-3 text-gray-500">
            <LanguageSwitcher />
            <span className="text-xs">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
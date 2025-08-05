// frontend/src/components/Navbar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import TaskbarButton from './TaskbarButton';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../i18n';

function Navbar({ onToggleTestWindow, onToggleBlogWindow, onToggleMusicWindow, getWindowState }) {
  const { t } = useLanguage();
  
  const testWindowState = getWindowState('test');
  const blogWindowState = getWindowState('blog');
  const musicWindowState = getWindowState('music');
  
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
            <TaskbarButton to="/" icon="blog" label={t('nav.blog')} />
            <button
              onClick={onToggleMusicWindow}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 min-w-[60px] max-w-[80px] ${
                musicWindowState.isFocused 
                  ? 'bg-blue-100 text-blue-600 shadow-inner border border-blue-200' 
                  : musicWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border border-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Music Player"
            >
              <div className="w-5 h-5 mb-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <span className="text-xs font-medium truncate">Music</span>
            </button>
            <TaskbarButton to="/gallery" icon="gallery" label={t('nav.gallery')} />
            
            {/* Blog Window Button */}
            <button
              onClick={onToggleBlogWindow}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 min-w-[60px] max-w-[80px] ${
                blogWindowState.isFocused 
                  ? 'bg-blue-100 text-blue-600 shadow-inner border border-blue-200' 
                  : blogWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border border-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Blog Window"
            >
              <div className="w-5 h-5 mb-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2H6Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M8 6H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 14H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xs font-medium truncate">Blog</span>
            </button>
            
            {/* Test Window Button */}
            <button
              onClick={onToggleTestWindow}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 min-w-[60px] max-w-[80px] ${
                testWindowState.isFocused 
                  ? 'bg-blue-100 text-blue-600 shadow-inner border border-blue-200' 
                  : testWindowState.isOpen
                  ? 'bg-gray-100 text-gray-700 border border-gray-300'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Toggle Test Window"
            >
              <div className="w-5 h-5 mb-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <span className="text-xs font-medium truncate">Test</span>
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
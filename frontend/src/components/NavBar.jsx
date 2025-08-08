// frontend/src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import Clock from './Clock';
import StartMenu from './StartMenu';
import { useLanguage } from '../i18n';

function Navbar({ onToggleBlogWindow, onToggleMusicWindow, onToggleGalleryWindow, onToggleInfoWindow, getWindowState }) {
  const { t } = useLanguage();
  const [hoveredButton, setHoveredButton] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [displayText, setDisplayText] = useState('[kunnic]');
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  
  const blogWindowState = getWindowState('blog');
  const musicWindowState = getWindowState('music');
  const galleryWindowState = getWindowState('gallery');
  const infoWindowState = getWindowState('info');

  // Word shuffle animation on component mount
  useEffect(() => {
    const targetText = '[kunnic]';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}';
    let animationFrame;
    let iteration = 0;
    let frameCount = 0;

    const animate = () => {
      // Faster shuffle: update every frame instead of controlling by iteration
      setDisplayText(prevText => 
        targetText
          .split('')
          .map((letter, index) => {
            // Left to right animation: reveal from left to right starting with 'k'
            if (index < iteration) {
              return targetText[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      if (iteration >= targetText.length) {
        setDisplayText(targetText);
        return;
      }

      frameCount++;
      // Much slower iteration progression but faster visual shuffle
      // Reveal one character every 120 frames (about 2 seconds at 60fps)
      if (frameCount % 120 === 0) {
        iteration += 1;
      }
      
      animationFrame = requestAnimationFrame(animate);
    };

    // Start animation after a short delay
    const timer = setTimeout(() => {
      animate();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

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

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
  };

  const closeStartMenu = () => {
    setIsStartMenuOpen(false);
  };

  // Handle keyboard shortcuts (Ctrl+Esc for start menu - Windows equivalent)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey && event.key === 'Escape') || event.key === 'Meta') {
        event.preventDefault();
        toggleStartMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStartMenuOpen]);
  
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
            <button 
              onClick={toggleStartMenu}
              onMouseEnter={(e) => handleMouseEnter('Start Menu (Ctrl+Esc)', e)}
              onMouseLeave={handleMouseLeave}
              className={`flex items-center px-4 py-2 text-gray-800 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 font-bold text-lg w-fit font-mono rounded-lg ${
                isStartMenuOpen ? 'bg-gray-200 shadow-inner' : 'hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Windows-style start button icon */}
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M216,48H152V32a16,16,0,0,0-16-16H32A16,16,0,0,0,16,32V152a16,16,0,0,0,16,16H104v48a16,16,0,0,0,16,16h96a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM32,152V32H136V152Zm184,64H120V168h32a16,16,0,0,0,16-16V64h48Z"/>
                  </svg>
                </div>
                {displayText}
              </div>
            </button>
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
              <svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="256" height="256" fill="none"/>
                <circle cx="180" cy="164" r="28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <circle cx="52" cy="196" r="28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <line x1="208" y1="72" x2="80" y2="104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <polyline points="80 196 80 56 208 24 208 164" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
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
              <svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="256" height="256" fill="none"/>
                <rect x="64" y="48" width="160" height="128" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <circle cx="172" cy="84" r="12"/>
                <path d="M64,128.69l38.34-38.35a8,8,0,0,1,11.32,0L163.31,140,189,114.34a8,8,0,0,1,11.31,0L224,138.06" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <path d="M192,176v24a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8H64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
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
              <svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="256" height="256" fill="none"/>
                <rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <line x1="80" y1="96" x2="176" y2="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <line x1="80" y1="128" x2="176" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <line x1="80" y1="160" x2="176" y2="160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
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
              <svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="256" height="256" fill="none"/>
                <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <path d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <circle cx="124" cy="84" r="12" fill="currentColor"/>
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
    
    {/* Start Menu */}
    <StartMenu
      isOpen={isStartMenuOpen}
      onClose={closeStartMenu}
      onToggleBlogWindow={onToggleBlogWindow}
      onToggleMusicWindow={onToggleMusicWindow}
      onToggleGalleryWindow={onToggleGalleryWindow}
      onToggleInfoWindow={onToggleInfoWindow}
    />
    </>
  );
}

export default Navbar;
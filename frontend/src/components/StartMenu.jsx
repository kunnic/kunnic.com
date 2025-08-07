// StartMenu.jsx - Windows-style start menu component

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n';

function StartMenu({ 
  isOpen, 
  onClose, 
  onToggleBlogWindow, 
  onToggleMusicWindow, 
  onToggleGalleryWindow, 
  onToggleInfoWindow 
}) {
  const { t } = useLanguage();
  const menuRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleItemClick = (action) => {
    action();
    onClose();
  };

  const menuItems = [
    {
      id: 'music',
      name: 'Music Player',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
          <circle cx="180" cy="164" r="28"/>
          <circle cx="52" cy="196" r="28"/>
          <line x1="208" y1="72" x2="80" y2="104"/>
          <polyline points="80 196 80 56 208 24 208 164"/>
        </svg>
      ),
      action: onToggleMusicWindow
    },
    {
      id: 'gallery',
      name: 'Gallery',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
          <rect x="64" y="48" width="160" height="128" rx="8"/>
          <circle cx="172" cy="84" r="12"/>
          <path d="M64,128.69l38.34-38.35a8,8,0,0,1,11.32,0L163.31,140,189,114.34a8,8,0,0,1,11.31,0L224,138.06"/>
          <path d="M192,176v24a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8H64"/>
        </svg>
      ),
      action: onToggleGalleryWindow
    },
    {
      id: 'blog',
      name: 'Blog',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
          <rect x="32" y="48" width="192" height="160" rx="8"/>
          <line x1="80" y1="96" x2="176" y2="96"/>
          <line x1="80" y1="128" x2="176" y2="128"/>
          <line x1="80" y1="160" x2="176" y2="160"/>
        </svg>
      ),
      action: onToggleBlogWindow
    },
    {
      id: 'info',
      name: 'Portfolio Info',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
          <circle cx="128" cy="128" r="96"/>
          <path d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8"/>
          <circle cx="124" cy="84" r="12" fill="currentColor"/>
        </svg>
      ),
      action: onToggleInfoWindow
    }
  ];

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-20" />
      
      {/* Start Menu */}
      <div
        ref={menuRef}
        className="fixed bottom-14 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl w-80 max-h-96 overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        style={{
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          animation: 'startMenuSlide 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-lg font-bold">K</span>
            </div>
            <div>
              <div className="font-semibold">kunnic</div>
              <div className="text-xs opacity-90">Portfolio Desktop</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
              viewBox="0 0 256 256" 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="16"
            >
              <circle cx="116" cy="116" r="84"/>
              <path d="m201 201 15 15"/>
            </svg>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="max-h-60 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="p-2">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.action)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 hover:border-l-4 hover:border-l-blue-500 rounded-lg transition-all duration-150 text-left group"
                >
                  <div className="flex-shrink-0 text-gray-600 group-hover:text-blue-600 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate group-hover:text-blue-900">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      Application
                    </div>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No results found</div>
              <div className="text-xs mt-1">Try a different search term</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
              </svg>
              <span>All applications</span>
            </div>
            <button
              onClick={onClose}
              className="hover:text-gray-800 transition-colors"
              title="Close menu"
            >
              <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default StartMenu;

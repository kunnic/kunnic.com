// src/components/Window/BlogWindow.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../i18n';

const BlogWindow = ({ onClose, onFocus, zIndex = 40, onMinimize }) => {
  const { t } = useLanguage();

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded-lg overflow-hidden select-none flex flex-col"
      style={{ 
        width: '600px', 
        height: '500px', 
        left: '150px', 
        top: '80px',
        zIndex: zIndex 
      }}
      onMouseDown={() => onFocus && onFocus()}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Blog</span>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={onMinimize}
            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded"
          >
            −
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded"
          >
            □
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-500 rounded"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Blog Window</h1>
        <p>This is a simplified blog window for testing.</p>
      </div>
    </div>
  );
};

export default BlogWindow;

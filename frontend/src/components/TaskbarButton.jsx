// src/components/TaskbarButton.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

function TaskbarButton({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        flex flex-col items-center justify-center 
        px-3 py-2 rounded-lg transition-all duration-200 
        hover:bg-gray-100 active:bg-gray-200
        min-w-[60px] max-w-[80px]
        ${isActive 
          ? 'bg-blue-100 text-blue-600 shadow-inner border border-blue-200' 
          : 'text-gray-600 hover:text-gray-900'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <Icon 
            name={icon} 
            className={`w-5 h-5 mb-1 ${isActive ? 'text-blue-600' : 'text-current'}`} 
          />
          <span className="text-xs font-medium truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default TaskbarButton;

// src/components/Icon.jsx
import React from 'react';

const icons = {
  blog: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  music: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="18" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 18V2L22 6L12 18Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  gallery: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

function Icon({ name, className = "w-6 h-6", ...props }) {
  const iconSvg = icons[name];
  
  if (!iconSvg) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <div className={className} {...props}>
      {React.cloneElement(iconSvg, { 
        width: "100%", 
        height: "100%",
        className: "w-full h-full"
      })}
    </div>
  );
}

export default Icon;

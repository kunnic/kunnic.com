// src/components/Icon.jsx
import React from 'react';

const icons = {
  blog: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="80" y1="96" x2="176" y2="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="80" y1="128" x2="176" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="80" y1="160" x2="176" y2="160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  ),
  music: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <circle cx="180" cy="164" r="28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <circle cx="52" cy="196" r="28" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <line x1="208" y1="72" x2="80" y2="104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <polyline points="80 196 80 56 208 24 208 164" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  ),
  gallery: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <rect x="64" y="48" width="160" height="128" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <circle cx="172" cy="84" r="12"/>
      <path d="M64,128.69l38.34-38.35a8,8,0,0,1,11.32,0L163.31,140,189,114.34a8,8,0,0,1,11.31,0L224,138.06" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <path d="M192,176v24a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V88a8,8,0,0,1,8-8H64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <path d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <circle cx="124" cy="84" r="12" fill="currentColor"/>
    </svg>
  ),
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="none"/>
      <path d="M152,208V160a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v48a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V115.54a8,8,0,0,1,2.62-5.92l80-75.54a8,8,0,0,1,10.77,0l80,75.54A8,8,0,0,1,216,115.54V208a8,8,0,0,1-8,8H160A8,8,0,0,1,152,208Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
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

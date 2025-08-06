import React from 'react';

export const getIcon = (iconType, className = "w-5 h-5") => {
  const icons = {
    user: (
      <svg className={className} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <circle cx="128" cy="96" r="64"/>
        <path d="M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56"/>
      </svg>
    ),
    windows: (
      <svg className={className} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <polygon points="208 216 128 201.46 128 201.46 128 144 208 144 208 216"/>
        <polygon points="96 195.64 32 184 32 144 96 144 96 195.64"/>
        <polygon points="208 40 128 54.55 128 54.55 128 112 208 112 208 40"/>
        <polygon points="96 60.36 32 72 32 112 96 112 96 60.36"/>
      </svg>
    ),
    computer: (
      <svg className={className} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <rect x="32" y="48" width="192" height="144" rx="16" transform="translate(256 240) rotate(180)"/>
        <line x1="160" y1="224" x2="96" y2="224"/>
      </svg>
    ),
    network: (
      <svg className={className} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <circle cx="128" cy="136" r="32"/>
        <path d="M80,192a60,60,0,0,1,96,0"/>
        <rect x="32" y="48" width="192" height="160" rx="8" transform="translate(256) rotate(90)"/>
        <line x1="96" y1="64" x2="160" y2="64"/>
      </svg>
    ),
    shield: (
      <svg className={className} viewBox="0 0 256 256" fill="currentColor">
        <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.73,225.86,102.82Zm-52.2,6.84-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"/>
      </svg>
    ),
    contact: (
      <svg className={className} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <circle cx="128" cy="96" r="64"/>
        <path d="M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56"/>
      </svg>
    ),
    email: (
      <svg className={className} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <polyline points="224 56 128 144 32 56"/>
        <path d="M32,56H224a0,0,0,0,1,0,0V192a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V56A0,0,0,0,1,32,56Z"/>
        <line x1="110.55" y1="128" x2="34.47" y2="197.74"/>
        <line x1="221.53" y1="197.74" x2="145.45" y2="128"/>
      </svg>
    ),
    linkedin: (
      <svg className={className} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <rect x="32" y="32" width="192" height="192" rx="8"/>
        <line x1="120" y1="112" x2="120" y2="176"/>
        <line x1="88" y1="112" x2="88" y2="176"/>
        <path d="M120,140a28,28,0,0,1,56,0v36"/>
        <circle cx="88" cy="84" r="12"/>
      </svg>
    ),
    github: (
      <svg className={className} viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
        <path d="M119.83,56A52,52,0,0,0,76,32a51.92,51.92,0,0,0-3.49,44.7A49.28,49.28,0,0,0,64,104v8a48,48,0,0,0,48,48h48a48,48,0,0,0,48-48v-8a49.28,49.28,0,0,0-8.51-27.3A51.92,51.92,0,0,0,196,32a52,52,0,0,0-43.83,24Z"/>
        <path d="M104,232V192a32,32,0,0,1,32-32h0a32,32,0,0,1,32,32v40"/>
        <path d="M104,208H72a32,32,0,0,1-32-32A32,32,0,0,0,8,144"/>
      </svg>
    )
  };

  return icons[iconType] || icons.user;
};

export const getColorClass = (color) => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500',
    yellow: 'bg-yellow-500',
    indigo: 'bg-indigo-500'
  };
  
  return colorMap[color] || 'bg-gray-500';
};

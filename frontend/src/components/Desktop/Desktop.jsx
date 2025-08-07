// Desktop component - enhanced gradient background desktop
import React from 'react';

function Desktop() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Multi-layer gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-300/30 via-transparent to-indigo-500/20"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-300/20 rounded-full blur-lg animate-bounce" style={{animationDuration: '3s'}}></div>
        <div className="absolute top-1/2 left-3/4 w-16 h-16 bg-purple-300/15 rounded-full blur-md animate-ping" style={{animationDuration: '4s'}}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {/* Desktop with enhanced gradient background - windows will be rendered here */}
      </div>
    </div>
  );
}

export default Desktop;

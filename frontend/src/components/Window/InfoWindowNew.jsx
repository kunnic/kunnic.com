// src/components/Window/InfoWindow.jsx
import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import infoWindowData from '../../data/infoWindowData.json';
import { getIcon, getColorClass } from '../../utils/iconUtils.jsx';

const InfoWindow = ({ onClose, onFocus, zIndex = 40, onMinimize, isMinimized = false }) => {
  const windowRef = useRef(null);
  const onFocusRef = useRef(onFocus);
  
  // Update the ref whenever onFocus changes
  useEffect(() => {
    onFocusRef.current = onFocus;
  }, [onFocus]);

  const [windowState, setWindowState] = useState({
    x: 200,
    y: 100,
    width: 500,
    height: 400,
    isMaximized: false
  });

  // Store original state for restore
  const [originalState, setOriginalState] = useState({
    x: 200,
    y: 100,
    width: 500,
    height: 400
  });

  // Add CSS animation for striped gradient
  useEffect(() => {
    const styleId = 'stripe-gradient-animation-styles';
    
    // Check if styles are already added
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes silverGradientWave {
          0%, 100% {
            background-position: 90% 30%;
          }
          12% {
            background-position: 85% 60%;
          }
          27% {
            background-position: 140% 25%;
          }
          41% {
            background-position: 220% 75%;
          }
          58% {
            background-position: 310% 45%;
          }
          73% {
            background-position: 180% 85%;
          }
          89% {
            background-position: 95% 15%;
          }
        }
        
        @keyframes silverShimmer {
          0%, 100% {
            filter: brightness(1) contrast(1);
            background-size: 400% 400%;
          }
          15% {
            filter: brightness(1.15) contrast(1.2);
            background-size: 450% 350%;
          }
          32% {
            filter: brightness(0.75) contrast(0.85);
            background-size: 350% 450%;
          }
          47% {
            filter: brightness(1.25) contrast(1.1);
            background-size: 500% 300%;
          }
          64% {
            filter: brightness(0.9) contrast(1.3);
            background-size: 300% 500%;
          }
          78% {
            filter: brightness(1.05) contrast(0.95);
            background-size: 420% 380%;
          }
          91% {
            filter: brightness(1.3) contrast(1.15);
            background-size: 380% 420%;
          }
        }
        
        .rotating-gradient {
          background: linear-gradient(75deg, #c0c0c0, #e8e8e8, #b8b8b8, #f0f0f0, #a8a8a8, #d8d8d8, #c8c8c8, #f8f8f8, #b0b0b0, #e0e0e0, #c0c0c0);
        }
        
        @keyframes stripeFlow {
          0% {
            background-position: -100% 0%;
          }
          100% {
            background-position: 100% 0%;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    // Get actual taskbar height dynamically
    const getTaskbarHeight = () => {
      const taskbar = document.querySelector('nav'); // NavBar component
      return taskbar ? taskbar.offsetHeight : 52; // fallback to estimated height
    };

    // Make the window draggable
    interact(windowElement)
      .draggable({
        // Enable dragging from the title bar only - use ID-specific selector
        allowFrom: '#info-window .window-title-bar',
        // Prevent dragging when interacting with window controls
        ignoreFrom: 'button',
        listeners: {
          start(event) {
            event.target.classList.add('interact-dragging');
            // Bring window to front when dragging starts
            if (onFocusRef.current) onFocusRef.current();
          },
          move(event) {
            const target = event.target;
            
            // Get current position from data attributes
            const currentX = parseFloat(target.getAttribute('data-x')) || 0;
            const currentY = parseFloat(target.getAttribute('data-y')) || 0;
            
            // Calculate new position
            const newX = currentX + event.dx;
            const newY = currentY + event.dy;

            // Get window dimensions for boundary checking
            const rect = target.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const taskbarHeight = getTaskbarHeight();
            const maxAvailableHeight = viewportHeight - taskbarHeight;
            
            // Calculate boundaries - allow more flexible positioning
            const maxX = viewportWidth - rect.width;
            const maxY = maxAvailableHeight - rect.height;
            
            // Apply boundaries - prevent going off-screen on left, allow partial on right
            const boundedX = Math.max(0, Math.min(newX, Math.max(0, maxX))); // Keep fully on screen horizontally
            const boundedY = Math.max(0, Math.min(newY, Math.max(0, maxY))); // Stay within top and taskbar bounds

            // Apply transform
            target.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
            
            // Update data attributes
            target.setAttribute('data-x', boundedX);
            target.setAttribute('data-y', boundedY);

            // Update React state
            setWindowState(prev => ({ 
              ...prev, 
              x: boundedX, 
              y: boundedY 
            }));
          },
          end(event) {
            event.target.classList.remove('interact-dragging');
          }
        }
      })
      .resizable({
        // Resize from specific edges and corners only - use ID-specific selectors
        edges: {
          left: '#info-window .resize-left',
          right: '#info-window .resize-right', 
          bottom: '#info-window .resize-bottom',
          top: '#info-window .resize-top'
        },
        listeners: {
          start(event) {
            event.target.classList.add('interact-resizing');
          },
          move(event) {
            const target = event.target;
            let { x, y } = target.dataset;

            // Parse current position
            x = parseFloat(x) || 0;
            y = parseFloat(y) || 0;

            // Get viewport dimensions and taskbar height
            const viewportHeight = window.innerHeight;
            const taskbarHeight = getTaskbarHeight();
            const maxAvailableHeight = viewportHeight - taskbarHeight;

            // Calculate new position and size
            let newX = x + event.deltaRect.left;
            let newY = y + event.deltaRect.top;
            let newWidth = event.rect.width;
            let newHeight = event.rect.height;

            // Handle horizontal constraints
            if (newX < 0) {
              // If resizing would push window off left edge, adjust width instead
              newWidth = newWidth + newX; // Reduce width by the amount it would go off-screen
              newX = 0; // Keep at left edge
            }
            
            if (newX + newWidth > window.innerWidth) {
              // If resizing would push window off right edge, just limit the width
              newWidth = window.innerWidth - newX;
            }

            // Handle vertical constraints
            if (newY < 0) {
              // If resizing would push window above screen, adjust height instead
              newHeight = newHeight + newY; // Reduce height by the amount it would go off-screen
              newY = 0; // Keep at top edge
            }
            
            if (newY + newHeight > maxAvailableHeight) {
              // If resizing would push window below taskbar, just limit the height
              newHeight = maxAvailableHeight - newY;
            }

            // Enforce minimum size constraints
            newWidth = Math.max(400, newWidth);
            newHeight = Math.max(300, newHeight);

            // If we're at minimum size and at an edge, allow the window to move
            // to accommodate resize from the opposite edge
            if (newWidth === 400 && newX > 0 && event.deltaRect.left < 0) {
              // Allow moving left when resizing from right edge at minimum width
              newX = Math.max(0, newX + event.deltaRect.left);
            }
            
            if (newHeight === 300 && newY > 0 && event.deltaRect.top < 0) {
              // Allow moving up when resizing from bottom edge at minimum height
              newY = Math.max(0, newY + event.deltaRect.top);
            }

            // Apply new size and position
            Object.assign(target.style, {
              width: `${newWidth}px`,
              height: `${newHeight}px`,
              transform: `translate(${newX}px, ${newY}px)`
            });

            // Update data attributes
            Object.assign(target.dataset, { x: newX, y: newY });

            // Update React state
            setWindowState(prev => ({
              ...prev,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight
            }));
          },
          end(event) {
            event.target.classList.remove('interact-resizing');
          }
        },
        modifiers: [
          // Only enforce minimum size - let our custom logic handle boundaries
          interact.modifiers.restrictSize({
            min: { width: 400, height: 300 }
            // Remove max restrictions to allow our custom boundary logic to work
          })
          // Remove restrictRect modifier - we handle boundaries in the move event
        ]
      });

    // Set initial position and size
    windowElement.style.transform = `translate(${windowState.x}px, ${windowState.y}px)`;
    windowElement.style.width = `${windowState.width}px`;
    windowElement.style.height = `${windowState.height}px`;
    windowElement.setAttribute('data-x', windowState.x);
    windowElement.setAttribute('data-y', windowState.y);

    // Cleanup
    return () => {
      interact(windowElement).unset();
    };
  }, []); // Only run once on mount

  // Handle enabling/disabling resize and drag based on maximized state
  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    const interactInstance = interact(windowElement);
    if (windowState.isMaximized) {
      // Disable resizing and dragging when maximized
      interactInstance.resizable(false);
      interactInstance.draggable(false);
    } else {
      // Re-enable both dragging and resizing when not maximized
      interactInstance.draggable({
        allowFrom: '#info-window .window-title-bar',
        ignoreFrom: 'button',
        listeners: {
          start(event) {
            event.target.classList.add('interact-dragging');
            if (onFocusRef.current) onFocusRef.current();
          },
          move(event) {
            const target = event.target;
            
            const currentX = parseFloat(target.getAttribute('data-x')) || 0;
            const currentY = parseFloat(target.getAttribute('data-y')) || 0;
            
            const newX = currentX + event.dx;
            const newY = currentY + event.dy;

            const rect = target.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const taskbarHeight = document.querySelector('nav')?.offsetHeight || 52;
            const maxAvailableHeight = viewportHeight - taskbarHeight;
            
            const maxX = viewportWidth - rect.width;
            const maxY = maxAvailableHeight - rect.height;
            
            // Apply boundaries - keep fully on screen
            const boundedX = Math.max(0, Math.min(newX, Math.max(0, maxX)));
            const boundedY = Math.max(0, Math.min(newY, Math.max(0, maxY)));

            target.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
            
            target.setAttribute('data-x', boundedX);
            target.setAttribute('data-y', boundedY);

            setWindowState(prev => ({ 
              ...prev, 
              x: boundedX, 
              y: boundedY 
            }));
          },
          end(event) {
            event.target.classList.remove('interact-dragging');
          }
        }
      });
      
      // Re-enable resizing when not maximized
      interactInstance.resizable({
        edges: {
          left: '#info-window .resize-left',
          right: '#info-window .resize-right', 
          bottom: '#info-window .resize-bottom',
          top: '#info-window .resize-top'
        },
        listeners: {
          start(event) {
            event.target.classList.add('interact-resizing');
          },
          move(event) {
            const target = event.target;
            let { x, y } = target.dataset;

            // Parse current position
            x = parseFloat(x) || 0;
            y = parseFloat(y) || 0;

            // Get viewport dimensions and taskbar height
            const viewportHeight = window.innerHeight;
            const taskbarHeight = document.querySelector('nav')?.offsetHeight || 52;
            const maxAvailableHeight = viewportHeight - taskbarHeight;

            // Calculate new position and size
            let newX = x + event.deltaRect.left;
            let newY = y + event.deltaRect.top;
            let newWidth = event.rect.width;
            let newHeight = event.rect.height;

            // Handle horizontal constraints
            if (newX < 0) {
              newWidth = newWidth + newX;
              newX = 0;
            }
            
            if (newX + newWidth > window.innerWidth) {
              newWidth = window.innerWidth - newX;
            }

            // Handle vertical constraints
            if (newY < 0) {
              newHeight = newHeight + newY;
              newY = 0;
            }
            
            if (newY + newHeight > maxAvailableHeight) {
              newHeight = maxAvailableHeight - newY;
            }

            // Enforce minimum size constraints
            newWidth = Math.max(400, newWidth);
            newHeight = Math.max(300, newHeight);

            // Apply new size and position
            Object.assign(target.style, {
              width: `${newWidth}px`,
              height: `${newHeight}px`,
              transform: `translate(${newX}px, ${newY}px)`
            });

            // Update data attributes
            Object.assign(target.dataset, { x: newX, y: newY });

            // Update React state
            setWindowState(prev => ({
              ...prev,
              x: newX,
              y: newY,
              width: newWidth,
              height: newHeight
            }));
          },
          end(event) {
            event.target.classList.remove('interact-resizing');
          }
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 400, height: 300 }
          })
        ]
      });
    }
  }, [windowState.isMaximized]);

  // Handle window resize separately to avoid dependency issues
  useEffect(() => {
    let resizeTimeout;
    
    const handleWindowResize = () => {
      // Debounce resize events to avoid too many updates
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const windowElement = windowRef.current;
        if (!windowElement) return;

        const getTaskbarHeight = () => {
          const taskbar = document.querySelector('nav');
          return taskbar ? taskbar.offsetHeight : 52;
        };

        const taskbarHeight = getTaskbarHeight();
        const maxAvailableHeight = window.innerHeight - taskbarHeight;
        
        // Update interact.js constraints dynamically
        const interactInstance = interact(windowElement);
        if (interactInstance.resizable) {
          interactInstance.resizable({
            modifiers: [
              // Only minimum size constraint - let our custom logic handle the rest
              interact.modifiers.restrictSize({
                min: { width: 400, height: 300 }
              })
            ]
          });
        }
        
        // Constrain current window position if it's now out of bounds
        const currentX = parseFloat(windowElement.getAttribute('data-x')) || 0;
        const currentY = parseFloat(windowElement.getAttribute('data-y')) || 0;
        const rect = windowElement.getBoundingClientRect();
        
        const maxX = window.innerWidth - rect.width;
        const maxY = maxAvailableHeight - rect.height;
        
        const constrainedX = Math.max(0, Math.min(currentX, maxX));
        const constrainedY = Math.max(0, Math.min(currentY, maxY));
        
        if (constrainedX !== currentX || constrainedY !== currentY) {
          windowElement.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
          windowElement.setAttribute('data-x', constrainedX);
          windowElement.setAttribute('data-y', constrainedY);
          
          setWindowState(prev => ({
            ...prev,
            x: constrainedX,
            y: constrainedY
          }));
        }

        // If maximized, adjust to new viewport size
        if (windowState.isMaximized) {
          const newHeight = maxAvailableHeight;
          windowElement.style.width = `${window.innerWidth}px`;
          windowElement.style.height = `${newHeight}px`;
          windowElement.style.transform = 'translate(0px, 0px)';
          
          setWindowState(prev => ({
            ...prev,
            width: window.innerWidth,
            height: newHeight
          }));
        }
      }, 100); // Debounce by 100ms
    };

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      clearTimeout(resizeTimeout);
    };
  }, [windowState.isMaximized]);

  const handleMaximize = () => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    if (windowState.isMaximized) {
      // Restore to original size and position
      windowElement.style.width = `${originalState.width}px`;
      windowElement.style.height = `${originalState.height}px`;
      windowElement.style.transform = `translate(${originalState.x}px, ${originalState.y}px)`;
      
      // Update data attributes
      windowElement.setAttribute('data-x', originalState.x);
      windowElement.setAttribute('data-y', originalState.y);
      
      setWindowState({ 
        ...originalState,
        isMaximized: false 
      });
    } else {
      // Store current state before maximizing
      setOriginalState({
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height
      });
      
      // Maximize
      const taskbar = document.querySelector('nav'); // NavBar component
      const taskbarHeight = taskbar ? taskbar.offsetHeight : 52; // fallback to estimated height
      const maxHeight = window.innerHeight - taskbarHeight;
      
      windowElement.style.width = '100vw';
      windowElement.style.height = `${maxHeight}px`;
      windowElement.style.transform = 'translate(0px, 0px)';
      
      // Update data attributes
      windowElement.setAttribute('data-x', '0');
      windowElement.setAttribute('data-y', '0');
      
      setWindowState(prev => ({ 
        ...prev,
        x: 0,
        y: 0, 
        width: window.innerWidth,
        height: maxHeight,
        isMaximized: true 
      }));
    }
  };

  const handleMinimize = () => {
    // Call the minimize handler from parent if provided
    if (onMinimize) {
      onMinimize();
    } else {
      // Fallback: just hide the window
      const windowElement = windowRef.current;
      if (windowElement) {
        windowElement.style.display = 'none';
      }
    }
  };

  return (
    <div
      ref={windowRef}
      id="info-window"
      className={`absolute bg-white border border-gray-300 overflow-hidden select-none flex flex-col ${windowState.isMaximized ? '' : 'rounded-lg'} ${isMinimized ? 'hidden' : ''}`}
      style={{
        width: `${windowState.width}px`,
        height: `${windowState.height}px`,
        minWidth: '400px',
        minHeight: '300px',
        userSelect: 'none',
        zIndex: zIndex
      }}
      onMouseDown={() => !isMinimized && onFocus && onFocus()}
      onClick={() => !isMinimized && onFocus && onFocus()}
    >
      {/* Title Bar */}
      <div 
        className="window-title-bar rotating-gradient flex items-center justify-between px-3 py-2 cursor-move select-none flex-shrink-0"
        style={{
          backgroundSize: '400% 400%',
          animation: 'silverGradientWave 60s ease-in-out infinite, silverShimmer 20s linear infinite',
          color: '#2d3748',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
        }}
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
              <circle cx="128" cy="128" r="96"/>
              <path d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8"/>
              <circle cx="124" cy="84" r="12"/>
            </svg>
          </div>
          <span className="text-sm font-medium">Portfolio Info</span>
        </div>
        
        {/* Window Controls */}
        <div className="flex gap-1">
          <button
            onClick={handleMinimize}
            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded text-xs font-bold"
            title="Minimize"
          >
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
              <line x1="40" y1="128" x2="216" y2="128"/>
            </svg>
          </button>
          <button
            onClick={handleMaximize}
            className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded text-xs"
            title={windowState.isMaximized ? "Restore" : "Maximize"}
          >
            {windowState.isMaximized ? (
              <svg className="w-4 h-4" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                <rect x="40" y="72" width="144" height="144"/>
                <polyline points="72 40 216 40 216 184"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                <rect x="32" y="32" width="192" height="192" rx="8"/>
              </svg>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-500 rounded text-xs font-bold"
            title="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
              <line x1="200" y1="56" x2="56" y2="200"/>
              <line x1="200" y1="200" x2="56" y2="56"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 selectable-text">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-gray-800 mb-2">{infoWindowData.title}</h1>
              <p className="text-2xl text-gray-600">{infoWindowData.subtitle}</p>
            </div>

            <div className="space-y-6">
              {/* About Me */}
              {infoWindowData.sections.map((section) => {
                if (section.id === 'about') {
                  return (
                    <section key={section.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        {getIcon(section.icon, `w-5 h-5 ${section.iconColor}`)}
                        {section.title}
                      </h2>
                      <div className="text-gray-700 leading-relaxed text-lg">
                        <p>{section.content.greeting}</p>
                        <hr className='my-2 border-gray-300' />
                        <p>{section.content.description}</p>
                      </div>
                    </section>
                  );
                }

                if (section.id === 'os') {
                  return (
                    <section key={section.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        {getIcon(section.icon, `w-5 h-5 ${section.iconColor}`)}
                        {section.title}
                      </h2>
                      <div className="text-gray-700 leading-relaxed text-lg">
                        <p>{section.content.edition}</p>
                        <hr className='my-2 border-gray-300' />
                        <p>{section.content.copyright}</p>
                      </div>
                    </section>
                  );
                }

                if (section.id === 'system') {
                  return (
                    <section key={section.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        {getIcon(section.icon, `w-5 h-5 ${section.iconColor}`)}
                        {section.title}
                      </h2>
                      
                      {/* Motherboard-style grid layout */}
                      <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 relative">
                        {/* Component grid */}
                        <div className="relative grid grid-cols-12 gap-2 text-gray-800">
                          
                          {/* CPU Socket - Top left, large */}
                          <div className="col-span-6 bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded border-2 border-blue-300 shadow-lg">
                            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-base">
                              <svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className="text-blue-600">
                                <rect x="104" y="104" width="48" height="48"/>
                                <rect x="48" y="48" width="160" height="160" rx="8"/>
                                <line x1="208" y1="104" x2="232" y2="104"/>
                                <line x1="208" y1="152" x2="232" y2="152"/>
                                <line x1="24" y1="104" x2="48" y2="104"/>
                                <line x1="24" y1="152" x2="48" y2="152"/>
                                <line x1="152" y1="208" x2="152" y2="232"/>
                                <line x1="104" y1="208" x2="104" y2="232"/>
                                <line x1="152" y1="24" x2="152" y2="48"/>
                                <line x1="104" y1="24" x2="104" y2="48"/>
                              </svg>
                              CPU
                            </h3>
                            <div className="space-y-1">
                              <p className="font-medium text-blue-800 text-sm">{section.content.cpu.name}</p>
                              <div className="grid grid-cols-2 gap-1 text-sm text-blue-700">
                                {section.content.cpu.specs.map((spec, index) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <div className={`w-1 h-1 ${getColorClass(spec.color)} rounded-full`}></div>
                                    <span>{spec.name} {spec.speed}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* RAM Slots - Top right */}
                          <div className="col-span-6 bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 rounded border-2 border-emerald-300 shadow-lg">
                            <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2 text-base">
                              <svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className="text-emerald-600">
                                <path d="M24,64H232a8,8,0,0,1,8,8V176a0,0,0,0,1,0,0H16a0,0,0,0,1,0,0V72A8,8,0,0,1,24,64Z"/>
                                <line x1="16" y1="176" x2="16" y2="200"/>
                                <line x1="48" y1="176" x2="48" y2="200"/>
                                <line x1="80" y1="176" x2="80" y2="200"/>
                                <line x1="112" y1="176" x2="112" y2="200"/>
                                <line x1="144" y1="176" x2="144" y2="200"/>
                                <line x1="176" y1="176" x2="176" y2="200"/>
                                <line x1="208" y1="176" x2="208" y2="200"/>
                                <line x1="240" y1="176" x2="240" y2="200"/>
                                <rect x="48" y="96" width="64" height="48"/>
                                <rect x="144" y="96" width="64" height="48"/>
                              </svg>
                              Memory
                            </h3>
                            <div className="space-y-1">
                              <p className="font-medium text-emerald-800 text-sm">{section.content.memory.total}</p>
                              <div className="grid grid-cols-2 gap-1 text-sm text-emerald-700">
                                {section.content.memory.breakdown.map((mem, index) => (
                                  <div key={index} className="flex items-center gap-1">
                                    <div className={`w-1 h-1 ${getColorClass(mem.color)} rounded-full`}></div>
                                    <span>{mem.size} {mem.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Cache Memory - Middle left */}
                          <div className="col-span-4 bg-gradient-to-br from-cyan-100 to-cyan-200 p-3 rounded border-2 border-cyan-300 shadow-lg">
                            <h3 className="font-semibold text-cyan-800 mb-2 flex items-center gap-2 text-base">
                              <svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className="text-cyan-600">
                                <ellipse cx="128" cy="80" rx="88" ry="48"/>
                                <path d="M40,80v48c0,26.51,39.4,48,88,48s88-21.49,88-48V80"/>
                                <path d="M40,128v48c0,26.51,39.4,48,88,48s88-21.49,88-48V128"/>
                              </svg>
                              Cache
                            </h3>
                            <div className="space-y-1 text-sm text-cyan-700">
                              {section.content.cache.map((cache, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <div className={`w-1 h-1 ${getColorClass(cache.color)} rounded-full`}></div>
                                  <span>{cache.level} {cache.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Audio Processor - Middle center */}
                          <div className="col-span-4 bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded border-2 border-purple-300 shadow-lg">
                            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2 text-base">
                              <svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className="text-purple-600">
                                <rect x="32" y="56" width="192" height="144" rx="8" transform="translate(256 0) rotate(90)"/>
                                <circle cx="128" cy="76" r="12"/>
                                <circle cx="128" cy="152" r="32"/>
                              </svg>
                              APU
                            </h3>
                            <div className="text-sm text-purple-700">
                              <div className="flex items-center gap-1">
                                <div className={`w-1 h-1 ${getColorClass(section.content.apu.color)} rounded-full`}></div>
                                <span>{section.content.apu.name}</span>
                              </div>
                            </div>
                          </div>

                          {/* Storage - Middle right */}
                          <div className="col-span-4 bg-gradient-to-br from-green-100 to-green-200 p-3 rounded border-2 border-green-300 shadow-lg">
                            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2 text-base">
                              <svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className="text-green-600">
                                <rect x="24" y="72" width="208" height="112" rx="8"/>
                                <circle cx="188" cy="128" r="12"/>
                              </svg>
                              Storage
                            </h3>
                            <div className="space-y-1 text-sm text-green-700">
                              {section.content.storage.map((storage, index) => (
                                <div key={index} className="flex items-center gap-1">
                                  <div className={`w-1 h-1 ${getColorClass(storage.color)} rounded-full`}></div>
                                  <span>{storage.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* System Type - Bottom spanning */}
                          <div className="col-span-12 bg-gradient-to-r from-teal-100 to-teal-200 p-3 rounded border-2 border-teal-300 shadow-lg">
                            <h3 className="font-semibold text-teal-800 mb-2 flex items-center gap-2 text-base">
                              <svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" className="text-teal-600">
                                <path d="M144,184H32a16,16,0,0,1-16-16V96A16,16,0,0,1,32,80H144"/>
                                <line x1="112" y1="216" x2="64" y2="216"/>
                                <line x1="208" y1="72" x2="176" y2="72"/>
                                <line x1="208" y1="104" x2="176" y2="104"/>
                                <rect x="144" y="40" width="96" height="176" rx="8"/>
                                <line x1="88" y1="184" x2="88" y2="216"/>
                                <circle cx="192" cy="180" r="12"/>
                              </svg>
                              System Architecture
                            </h3>
                            <div className="flex items-center justify-between text-sm text-teal-700">
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
                                <span>{section.content.architecture.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                                <span>{section.content.architecture.version}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (section.id === 'computer-info') {
                  return (
                    <section key={section.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        {getIcon(section.icon, `w-5 h-5 ${section.iconColor}`)}
                        {section.title}
                      </h2>
                      <div className="space-y-3 text-gray-700 text-lg">
                        <div>
                          <span className="font-medium text-gray-800">Computer name:</span>
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-base font-mono">{section.content.computerName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Full computer name:</span>
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-base font-mono">{section.content.fullComputerName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Computer description:</span>
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded text-base">{section.content.description}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Workgroup:</span>
                          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-base font-mono">{section.content.workgroup}</span>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (section.id === 'activation') {
                  return (
                    <section key={section.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        {getIcon(section.icon, `w-5 h-5 ${section.iconColor}`)}
                        {section.title}
                      </h2>
                      <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-3">
                            <svg width="32" height="32" viewBox="0 0 256 256" fill="currentColor" className="text-green-600">
                              <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>
                            </svg>
                          </div>
                          <p className="text-2xl font-semibold text-green-800 mb-2">
                            {section.content.status}
                          </p>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (section.id === 'contact') {
                  return (
                    <section key={section.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                      <h2 className="text-2xl font-semibold text-gray-800 mb-3">{section.title}</h2>
                      <p className="text-gray-700 mb-4 text-lg">
                        {section.content.description}
                      </p>
                      <div className="flex justify-center gap-4 mb-4">
                        {section.content.links.map((link, index) => (
                          <button 
                            key={index}
                            onClick={() => window.open(link.url, '_blank')}
                            className={`flex items-center gap-2 px-4 py-2 ${link.color} text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-base`}
                          >
                            {getIcon(link.type, "w-4 h-4")}
                            {link.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-base text-gray-500">
                        {section.content.footer}
                      </p>
                    </section>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resize handles - positioned at edges and corners - only show when not maximized */}
      {!windowState.isMaximized && (
        <>
          {/* Top and bottom resize bars with fade effect */}
          <div 
            className="resize-top absolute top-0 left-6 right-6 h-0.5 cursor-ns-resize bg-transparent hover:bg-gray-400 hover:bg-opacity-40 transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to right, transparent, rgba(156, 163, 175, 0.4) 20%, rgba(156, 163, 175, 0.4) 80%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-bottom absolute bottom-0 left-6 right-6 h-0.5 cursor-ns-resize bg-transparent hover:bg-gray-400 hover:bg-opacity-40 transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to right, transparent, rgba(156, 163, 175, 0.4) 20%, rgba(156, 163, 175, 0.4) 80%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          
          {/* Left and right resize bars with fade effect */}
          <div 
            className="resize-left absolute left-0 top-6 bottom-6 w-0.5 cursor-ew-resize bg-transparent hover:bg-gray-400 hover:bg-opacity-40 transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to bottom, transparent, rgba(156, 163, 175, 0.4) 20%, rgba(156, 163, 175, 0.4) 80%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-right absolute right-0 top-6 bottom-6 w-0.5 cursor-ew-resize bg-transparent hover:bg-gray-400 hover:bg-opacity-40 transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to bottom, transparent, rgba(156, 163, 175, 0.4) 20%, rgba(156, 163, 175, 0.4) 80%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          
          {/* Corner resize handles - quarter circles */}
          <div 
            className="resize-top resize-left absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-transparent hover:bg-gray-400 hover:bg-opacity-50 transition-colors"
            style={{
              background: 'transparent',
              borderBottomRightRadius: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(156, 163, 175, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-top resize-right absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-transparent hover:bg-gray-400 hover:bg-opacity-50 transition-colors"
            style={{
              background: 'transparent',
              borderBottomLeftRadius: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(156, 163, 175, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-bottom resize-left absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-transparent hover:bg-gray-400 hover:bg-opacity-50 transition-colors"
            style={{
              background: 'transparent',
              borderTopRightRadius: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(156, 163, 175, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-bottom resize-right absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-transparent hover:bg-gray-400 hover:bg-opacity-50 transition-colors"
            style={{
              background: 'transparent',
              borderTopLeftRadius: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(156, 163, 175, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
        </>
      )}
    </div>
  );
};

export default InfoWindow;

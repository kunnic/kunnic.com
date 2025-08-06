// src/components/Window/InfoWindow.jsx
import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import { useLanguage } from '../../i18n';

const InfoWindow = ({ onClose, onFocus, zIndex = 40, onMinimize, isMinimized = false }) => {
  const { t } = useLanguage();
  const windowRef = useRef(null);
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
            if (onFocus) onFocus();
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

    const getTaskbarHeight = () => {
      const taskbar = document.querySelector('nav');
      return taskbar ? taskbar.offsetHeight : 52;
    };

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
            if (onFocus) onFocus();
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
            const taskbarHeight = getTaskbarHeight();
            const maxAvailableHeight = viewportHeight - taskbarHeight;
            
            const maxX = viewportWidth - rect.width;
            const maxY = maxAvailableHeight - rect.height;
            
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

            x = parseFloat(x) || 0;
            y = parseFloat(y) || 0;

            const viewportHeight = window.innerHeight;
            const taskbarHeight = getTaskbarHeight();
            const maxAvailableHeight = viewportHeight - taskbarHeight;

            let newX = x + event.deltaRect.left;
            let newY = y + event.deltaRect.top;
            let newWidth = event.rect.width;
            let newHeight = event.rect.height;

            if (newX < 0) {
              newWidth = newWidth + newX;
              newX = 0;
            }
            
            if (newX + newWidth > window.innerWidth) {
              newWidth = window.innerWidth - newX;
            }

            if (newY < 0) {
              newHeight = newHeight + newY;
              newY = 0;
            }
            
            if (newY + newHeight > maxAvailableHeight) {
              newHeight = maxAvailableHeight - newY;
            }

            newWidth = Math.max(400, newWidth);
            newHeight = Math.max(300, newHeight);

            Object.assign(target.style, {
              width: `${newWidth}px`,
              height: `${newHeight}px`,
              transform: `translate(${newX}px, ${newY}px)`
            });

            Object.assign(target.dataset, { x: newX, y: newY });

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

  // Handle window resize when browser is resized
  useEffect(() => {
    let resizeTimeout;
    const handleWindowResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (windowState.isMaximized) {
          const taskbar = document.querySelector('nav');
          const taskbarHeight = taskbar ? taskbar.offsetHeight : 52;
          const newHeight = window.innerHeight - taskbarHeight;
          
          setWindowState(prev => ({
            ...prev,
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: newHeight
          }));
        }
      }, 100);
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
      
      setWindowState(prev => ({ 
        ...originalState,
        isMaximized: false 
      }));
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
        className="window-title-bar flex items-center justify-between px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white cursor-move select-none flex-shrink-0"
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" viewBox="0 0 256 256" fill="currentColor">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
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
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"/>
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
                <polyline points="72,40 216,40 216,184"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                <rect x="40" y="40" width="176" height="176" rx="8"/>
              </svg>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-500 rounded text-xs font-bold"
            title="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 selectable-text">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">kunnic.com</h1>
              <p className="text-lg text-gray-600">Personal Portfolio & Creative Space</p>
            </div>

            <div className="space-y-6">
              <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-blue-600">
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/>
                  </svg>
                  About Me
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to my personal portfolio! I'm kunnic, and this is my creative digital space where I share my journey, projects, and passions. 
                  This website serves as a window into my world of development, creativity, and personal expression.
                </p>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-green-600">
                    <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM208,80,128,144,48,80V64l80,64,80-64V80Z"/>
                  </svg>
                  Features
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Interactive desktop-style interface
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Personal blog with thoughts and updates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Music player for my favorite tracks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Photo gallery showcasing memorable moments
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Multi-language support
                  </li>
                </ul>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" className="text-purple-600">
                    <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM64,88a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,88Zm0,32a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,120Zm0,32a8,8,0,0,1,8-8h80a8,8,0,0,1,0,16H72A8,8,0,0,1,64,152Z"/>
                  </svg>
                  Technology Stack
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">React</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Django</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded">Tailwind CSS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">SQLite</span>
                  </div>
                </div>
              </section>

              <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Get in Touch</h2>
                <p className="text-gray-600 mb-4">
                  Feel free to explore the different sections of my portfolio and get to know more about me!
                </p>
                <p className="text-sm text-gray-500">
                  Made with ❤️ using React & Django
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Resize handles - positioned at edges and corners - only show when not maximized */}
      {!windowState.isMaximized && (
        <>
          <div className="resize-top absolute top-0 left-2 right-2 h-1 cursor-ns-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-30 transition-colors"></div>
          <div className="resize-bottom absolute bottom-0 left-2 right-2 h-1 cursor-ns-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-30 transition-colors"></div>
          <div className="resize-left absolute left-0 top-2 bottom-2 w-1 cursor-ew-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-30 transition-colors"></div>
          <div className="resize-right absolute right-0 top-2 bottom-2 w-1 cursor-ew-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-30 transition-colors"></div>
          
          {/* Corner resize handles */}
          <div className="resize-top resize-left absolute top-0 left-0 w-2 h-2 cursor-nw-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors"></div>
          <div className="resize-top resize-right absolute top-0 right-0 w-2 h-2 cursor-ne-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors"></div>
          <div className="resize-bottom resize-left absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors"></div>
          <div className="resize-bottom resize-right absolute bottom-0 right-0 w-2 h-2 cursor-se-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors"></div>
        </>
      )}
    </div>
  );
};

export default InfoWindow;

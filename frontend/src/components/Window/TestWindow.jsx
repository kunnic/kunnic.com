// src/components/Window/TestWindow.jsx
import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';

const TestWindow = ({ onClose, onFocus, zIndex = 40, onMinimize, isMinimized = false }) => {
  const windowRef = useRef(null);
  const [windowState, setWindowState] = useState({
    x: 100,
    y: 100,
    width: 400,
    height: 300,
    isMaximized: false
  });

  // Store original state for restore
  const [originalState, setOriginalState] = useState({
    x: 100,
    y: 100,
    width: 400,
    height: 300
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
        // Enable dragging from the title bar only
        allowFrom: '.window-title-bar',
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
        // Resize from specific edges and corners only
        edges: {
          left: '.resize-left',
          right: '.resize-right', 
          bottom: '.resize-bottom',
          top: '.resize-top'
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
            newWidth = Math.max(300, newWidth);
            newHeight = Math.max(200, newHeight);

            // If we're at minimum size and at an edge, allow the window to move
            // to accommodate resize from the opposite edge
            if (newWidth === 300 && newX > 0 && event.deltaRect.left < 0) {
              // Allow moving left when resizing from right edge at minimum width
              newX = Math.max(0, newX + event.deltaRect.left);
            }
            
            if (newHeight === 200 && newY > 0 && event.deltaRect.top < 0) {
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
            min: { width: 300, height: 200 }
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
        allowFrom: '.window-title-bar',
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
          left: '.resize-left',
          right: '.resize-right', 
          bottom: '.resize-bottom',
          top: '.resize-top'
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
            newWidth = Math.max(300, newWidth);
            newHeight = Math.max(200, newHeight);

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
            min: { width: 300, height: 200 }
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
                min: { width: 300, height: 200 }
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
        
        const constrainedX = Math.max(-rect.width + 100, Math.min(currentX, maxX));
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
      className={`absolute bg-white border border-gray-300 overflow-hidden select-none flex flex-col ${windowState.isMaximized ? '' : 'rounded-lg'} ${isMinimized ? 'hidden' : ''}`}
      style={{
        width: `${windowState.width}px`,
        height: `${windowState.height}px`,
        minWidth: '300px',
        minHeight: '200px',
        userSelect: 'none',
        zIndex: zIndex
      }}
      onMouseDown={() => !isMinimized && onFocus && onFocus()}
      onClick={() => !isMinimized && onFocus && onFocus()}
    >
      {/* Title Bar */}
      <div 
        className="window-title-bar flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white cursor-move select-none flex-shrink-0"
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-xs">T</span>
          </div>
          <span className="text-sm font-medium">Test Window</span>
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

      {/* Window Content - with proper flex and overflow handling */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 select-text" style={{ userSelect: 'text' }}>
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Interactive Test Window</h2>
            <p className="text-gray-600 text-sm">Powered by interact.js</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Features:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Drag window by title bar</li>
              <li>✅ Resize from edges and corners</li>
              <li>✅ Minimize/Maximize buttons</li>
              <li>✅ Double-click title to maximize</li>
              <li>✅ Boundary constraints</li>
              <li>✅ Minimum size limits</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Window State:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Position: ({Math.round(windowState.x)}, {Math.round(windowState.y)})</div>
              <div>Size: {Math.round(windowState.width)} × {Math.round(windowState.height)}</div>
              <div>Maximized: {windowState.isMaximized ? 'Yes' : 'No'}</div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <div>Data-x: {windowRef.current?.getAttribute('data-x') || '0'}</div>
              <div>Data-y: {windowRef.current?.getAttribute('data-y') || '0'}</div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Interactive Demo:</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type something here..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                  Button 1
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                  Button 2
                </button>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">Try This:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Drag the title bar to move</li>
              <li>• Drag edges/corners to resize</li>
              <li>• Double-click title bar to maximize</li>
              <li>• Use control buttons</li>
              <li>• Test input fields and buttons</li>
            </ul>
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

export default TestWindow;

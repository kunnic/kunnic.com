// src/components/Window/GalleryWindow.jsx
import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import axiosClient from '../../api/axiosClient';

const GalleryWindow = ({ onClose, onFocus, zIndex = 40, onMinimize, isMinimized = false }) => {
  const windowRef = useRef(null);
  const [windowState, setWindowState] = useState({
    x: 250,
    y: 100,
    width: 700,
    height: 500,
    isMaximized: false
  });

  // Store original state for restore
  const [originalState, setOriginalState] = useState({
    x: 250,
    y: 100,
    width: 700,
    height: 500
  });

  // Gallery state
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0); // Force re-render during drag

  // Simple blue gradient for Gallery
  const getPositionBasedGradient = () => {
    return 'linear-gradient(to right, rgb(37, 99, 235), rgb(29, 78, 216))'; // blue-600 to blue-700
  };

  // Fetch images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('gallery/');
        setImages(response.data.results || response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load gallery images');
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Handle image selection
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

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
        allowFrom: '#gallery-window .window-title-bar',
        // Prevent dragging when interacting with window controls
        ignoreFrom: 'button',
        listeners: {
          start(event) {
            event.target.classList.add('interact-dragging');
            setIsDragging(true);
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
            
            // Calculate boundaries
            const maxX = viewportWidth - rect.width;
            const maxY = maxAvailableHeight - rect.height;
            
            // Apply boundaries - keep fully on screen
            const boundedX = Math.max(0, Math.min(newX, Math.max(0, maxX)));
            const boundedY = Math.max(0, Math.min(newY, Math.max(0, maxY)));

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
            
            // Force re-render for gradient update
            setDragCounter(prev => prev + 1);
          },
          end(event) {
            event.target.classList.remove('interact-dragging');
            setIsDragging(false);
          }
        }
      })
      .resizable({
        // Resize from specific edges and corners only - use ID-specific selectors
        edges: {
          left: '#gallery-window .resize-left',
          right: '#gallery-window .resize-right', 
          bottom: '#gallery-window .resize-bottom',
          top: '#gallery-window .resize-top'
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
            newWidth = Math.max(500, newWidth);
            newHeight = Math.max(400, newHeight);

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
            min: { width: 500, height: 400 }
          })
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
        allowFrom: '#gallery-window .window-title-bar',
        ignoreFrom: 'button',
        listeners: {
          start(event) {
            event.target.classList.add('interact-dragging');
            setIsDragging(true);
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
            
            // Force re-render for gradient update
            setDragCounter(prev => prev + 1);
          },
          end(event) {
            event.target.classList.remove('interact-dragging');
            setIsDragging(false);
          }
        }
      });
      
      // Re-enable resizing when not maximized
      interactInstance.resizable({
        edges: {
          left: '#gallery-window .resize-left',
          right: '#gallery-window .resize-right', 
          bottom: '#gallery-window .resize-bottom',
          top: '#gallery-window .resize-top'
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
            const taskbarHeight = document.querySelector('nav')?.offsetHeight || 52;
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

            newWidth = Math.max(500, newWidth);
            newHeight = Math.max(400, newHeight);

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
            min: { width: 500, height: 400 }
          })
        ]
      });
    }
  }, [windowState.isMaximized]);

  // Handle window resize separately to avoid dependency issues
  useEffect(() => {
    let resizeTimeout;
    
    const handleWindowResize = () => {
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
        
        const interactInstance = interact(windowElement);
        if (interactInstance.resizable) {
          interactInstance.resizable({
            modifiers: [
              interact.modifiers.restrictSize({
                min: { width: 500, height: 400 }
              })
            ]
          });
        }
        
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
      const taskbar = document.querySelector('nav');
      const taskbarHeight = taskbar ? taskbar.offsetHeight : 52;
      const maxHeight = window.innerHeight - taskbarHeight;
      
      windowElement.style.width = '100vw';
      windowElement.style.height = `${maxHeight}px`;
      windowElement.style.transform = 'translate(0px, 0px)';
      
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
    if (onMinimize) {
      onMinimize();
    }
  };

  return (
    <>
      <div
        ref={windowRef}
        id="gallery-window"
        className={`absolute bg-white border border-gray-300 overflow-hidden select-none flex flex-col ${windowState.isMaximized ? '' : 'rounded-lg'} ${isMinimized ? 'hidden' : ''}`}
        style={{
          width: `${windowState.width}px`,
          height: `${windowState.height}px`,
          minWidth: '500px',
          minHeight: '400px',
          userSelect: 'none',
          zIndex: zIndex
        }}
        onMouseDown={(e) => {
          // Only call onFocus if we're not interacting with buttons or resize handles
          if (!isMinimized && onFocus && 
              !e.target.closest('button') && 
              !e.target.classList.contains('resize-left') &&
              !e.target.classList.contains('resize-right') &&
              !e.target.classList.contains('resize-top') &&
              !e.target.classList.contains('resize-bottom')) {
            onFocus();
          }
        }}
      >
        {/* Title Bar */}
        <div 
          key={`title-bar-${dragCounter}`}
          className="window-title-bar flex items-center justify-between px-3 py-2 text-white cursor-move select-none flex-shrink-0"
          style={{ 
            background: getPositionBasedGradient()
          }}
          onDoubleClick={handleMaximize}
          onMouseDown={(e) => {
            // Call onFocus when clicking on the title bar (but not on buttons)
            if (!e.target.closest('button') && onFocus && !isMinimized) {
              onFocus();
            }
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" viewBox="0 0 256 256" fill="currentColor">
                <path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM40,54H216a2,2,0,0,1,2,2V82H38V56A2,2,0,0,1,40,54ZM216,202H40a2,2,0,0,1-2-2V94H218V200A2,2,0,0,1,216,202Z"/>
              </svg>
            </div>
            <span className="text-sm font-medium">Gallery</span>
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
          <div className="h-full overflow-y-auto p-6 select-text" style={{ userSelect: 'text' }}>
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-600">
                  <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p>Loading gallery...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-600">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/>
                    </svg>
                  </div>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Photo Gallery</h1>
                  <p className="text-gray-600">My collection of memorable moments</p>
                </div>

                {images.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" viewBox="0 0 256 256" fill="currentColor">
                          <path d="M216,42H40A14,14,0,0,0,26,56V200a14,14,0,0,0,14,14H216a14,14,0,0,0,14-14V56A14,14,0,0,0,216,42ZM40,54H216a2,2,0,0,1,2,2V82H38V56A2,2,0,0,1,40,54ZM216,202H40a2,2,0,0,1-2-2V94H218V200A2,2,0,0,1,216,202Z"/>
                        </svg>
                      </div>
                      <p>No images in gallery</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-shadow"
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image.image}
                          alt={image.caption}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-end">
                          <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-sm font-medium truncate">{image.caption}</p>
                            <p className="text-xs text-gray-300">
                              {new Date(image.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-black bg-opacity-50 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 256 256" fill="currentColor">
                              <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.48c.35.79,8.82,19.58,27.65,38.41C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.35c18.83-18.83,27.3-37.62,27.65-38.41A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resize handles - positioned at edges and corners - only show when not maximized */}
        {!windowState.isMaximized && (
          <>
            {/* Top and bottom resize bars with fade effect */}
            <div 
              className="resize-top absolute top-0 left-6 right-6 h-0.5 cursor-ns-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-40 transition-colors"
              style={{
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to right, transparent, rgba(37, 99, 235, 0.4) 20%, rgba(37, 99, 235, 0.4) 80%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            ></div>
            <div 
              className="resize-bottom absolute bottom-0 left-6 right-6 h-0.5 cursor-ns-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-40 transition-colors"
              style={{
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to right, transparent, rgba(37, 99, 235, 0.4) 20%, rgba(37, 99, 235, 0.4) 80%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            ></div>
            
            {/* Left and right resize bars with fade effect */}
            <div 
              className="resize-left absolute left-0 top-6 bottom-6 w-0.5 cursor-ew-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-40 transition-colors"
              style={{
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, transparent, rgba(37, 99, 235, 0.4) 20%, rgba(37, 99, 235, 0.4) 80%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            ></div>
            <div 
              className="resize-right absolute right-0 top-6 bottom-6 w-0.5 cursor-ew-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-40 transition-colors"
              style={{
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to bottom, transparent, rgba(37, 99, 235, 0.4) 20%, rgba(37, 99, 235, 0.4) 80%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            ></div>
            
            {/* Corner resize handles - quarter circles */}
            <div 
              className="resize-top resize-left absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-50 transition-colors"
              style={{
                background: 'transparent',
                borderBottomRightRadius: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(37, 99, 235, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            ></div>
            <div 
              className="resize-top resize-right absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-50 transition-colors"
              style={{
                background: 'transparent',
                borderBottomLeftRadius: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(37, 99, 235, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            ></div>
            <div 
              className="resize-bottom resize-left absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-50 transition-colors"
              style={{
                background: 'transparent',
                borderTopRightRadius: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(37, 99, 235, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            ></div>
            <div 
              className="resize-bottom resize-right absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-transparent hover:bg-blue-600 hover:bg-opacity-50 transition-colors"
              style={{
                background: 'transparent',
                borderTopLeftRadius: '100%'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(37, 99, 235, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            ></div>
          </>
        )}
      </div>

      {/* Lightbox for full-size image viewing */}
      {lightboxOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999]"
          onClick={closeLightbox}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <img
              src={selectedImage.image}
              alt={selectedImage.caption}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full flex items-center justify-center text-white transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 256 256" fill="currentColor">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
              </svg>
            </button>
            
            {/* Image info */}
            <div className="absolute bottom-4 left-4 right-4 text-center text-white">
              <h3 className="text-lg font-semibold mb-1">{selectedImage.caption}</h3>
              <p className="text-sm text-gray-300">
                {new Date(selectedImage.upload_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryWindow;

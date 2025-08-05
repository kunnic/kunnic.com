// src/components/Window/MusicWindow.jsx
import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import axiosClient from '../../api/axiosClient';

const MusicWindow = ({ onClose, onFocus, zIndex = 40, onMinimize, isMinimized = false }) => {
  const windowRef = useRef(null);
  const audioRef = useRef(null);
  const [windowState, setWindowState] = useState({
    x: 200,
    y: 120,
    width: 500,
    height: 400,
    isMaximized: false
  });

  // Store original state for restore
  const [originalState, setOriginalState] = useState({
    x: 200,
    y: 120,
    width: 400,
    height: 400
  });

  // Music player state
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('songs/');
        setSongs(response.data.results || response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load music library');
        console.error('Error fetching songs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next song if available
      const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
      if (currentIndex < songs.length - 1) {
        setCurrentSong(songs[currentIndex + 1]);
      }
    };
    const handleLoadStart = () => {
      setCurrentTime(0);
      setDuration(0);
    };
    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
    };
  }, [currentSong, songs]);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Auto-play when a new song is selected
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    // Reset audio state
    setCurrentTime(0);
    setIsPlaying(false);

    // Load and play the new song
    const playNewSong = async () => {
      try {
        audio.load(); // Force reload of the audio element
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      }
    };

    playNewSong();
  }, [currentSong]);

  // Audio control functions
  const playPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSong) {
      // If no song selected, play the first one
      if (songs.length > 0) {
        setCurrentSong(songs[0]);
        // Let the useEffect handle playing
      }
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }
  };

  const playPrevious = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    if (currentIndex > 0) {
      setCurrentSong(songs[currentIndex - 1]);
      // Let the useEffect handle playing
    }
  };

  const playNext = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    if (currentIndex < songs.length - 1) {
      setCurrentSong(songs[currentIndex + 1]);
      // Let the useEffect handle playing
    }
  };

  const handleSongSelect = (song) => {
    setCurrentSong(song);
    // Don't set isPlaying immediately - let the useEffect handle it
  };

  const handleSeek = (event) => {
    if (!audioRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    setVolume(Math.max(0, Math.min(1, percent)));
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
            newWidth = Math.max(350, newWidth);
            newHeight = Math.max(250, newHeight);

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
            min: { width: 350, height: 250 }
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

            newWidth = Math.max(350, newWidth);
            newHeight = Math.max(250, newHeight);

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
            min: { width: 350, height: 250 }
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
                min: { width: 350, height: 250 }
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
    } else {
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
        minWidth: '350px',
        minHeight: '250px',
        userSelect: 'none',
        zIndex: zIndex
      }}
      onMouseDown={() => !isMinimized && onFocus && onFocus()}
      onClick={() => !isMinimized && onFocus && onFocus()}
    >
      {/* Title Bar */}
      <div 
        className="window-title-bar flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white cursor-move select-none flex-shrink-0"
        onDoubleClick={handleMaximize}
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" viewBox="0 0 256 256" fill="currentColor">
              <path d="M212.92,25.69a8,8,0,0,0-6.86-1.45L80.08,50.12a8,8,0,0,0-6.85,6.86L48.11,182a8,8,0,0,0,6.86,9.14l125-25.89a8,8,0,0,0,6.85-6.86l25.12-125A8,8,0,0,0,212.92,25.69ZM180.05,149.31l-113.51,23.5,22.32-107.58,113.5-23.5Z"/>
            </svg>
          </div>
          <span className="text-sm font-medium">Music Player</span>
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

      {/* Window Content - Fixed layout to prevent playbar from being hidden */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hidden audio element for playback */}
        <audio
          ref={audioRef}
          src={currentSong?.audio_file}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Main content area - scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-600">
                <div className="w-8 h-8 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p>Loading music library...</p>
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
            <div className="space-y-4">
              {/* Currently Playing Section */}
              {currentSong && (
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Now Playing</h3>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {currentSong.cover_image ? (
                        <img 
                          src={currentSong.cover_image} 
                          alt={currentSong.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-white" viewBox="0 0 256 256" fill="currentColor">
                          <path d="M212.92,25.69a8,8,0,0,0-6.86-1.45L80.08,50.12a8,8,0,0,0-6.85,6.86L48.11,182a8,8,0,0,0,6.86,9.14l125-25.89a8,8,0,0,0,6.85-6.86l25.12-125A8,8,0,0,0,212.92,25.69Z"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-purple-900 truncate">{currentSong.title}</h4>
                      <p className="text-purple-700 text-sm truncate">{currentSong.artist || 'Unknown Artist'}</p>
                      <p className="text-purple-600 text-xs truncate">
                        {currentSong.release_date ? new Date(currentSong.release_date).getFullYear() : 'Unknown Year'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Music Library */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Music Library</h2>
                {songs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M212.92,25.69a8,8,0,0,0-6.86-1.45L80.08,50.12a8,8,0,0,0-6.85,6.86L48.11,182a8,8,0,0,0,6.86,9.14l125-25.89a8,8,0,0,0,6.85-6.86l25.12-125A8,8,0,0,0,212.92,25.69Z"/>
                      </svg>
                    </div>
                    <p>No songs in your library</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {songs.map((song, index) => (
                      <div
                        key={song.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          currentSong?.id === song.id
                            ? 'bg-purple-100 border-2 border-purple-300'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                        onClick={() => handleSongSelect(song)}
                      >
                        <div className="flex-shrink-0 w-8 text-sm text-gray-500 text-center">
                          {currentSong?.id === song.id && isPlaying ? (
                            <div className="flex items-center justify-center">
                              <div className="flex space-x-1">
                                <div className="w-1 h-4 bg-purple-600 animate-pulse"></div>
                                <div className="w-1 h-4 bg-purple-600 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                                <div className="w-1 h-4 bg-purple-600 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                              </div>
                            </div>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                          {song.cover_image ? (
                            <img 
                              src={song.cover_image} 
                              alt={song.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <svg className="w-5 h-5 text-purple-600" viewBox="0 0 256 256" fill="currentColor">
                              <path d="M212.92,25.69a8,8,0,0,0-6.86-1.45L80.08,50.12a8,8,0,0,0-6.85,6.86L48.11,182a8,8,0,0,0,6.86,9.14l125-25.89a8,8,0,0,0,6.85-6.86l25.12-125A8,8,0,0,0,212.92,25.69Z"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{song.title}</div>
                          <div className="text-sm text-gray-500 truncate">{song.artist || 'Unknown Artist'}</div>
                        </div>
                        <div className="flex-shrink-0 text-sm text-gray-400">
                          {song.release_date ? new Date(song.release_date).getFullYear() : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Fixed playbar at bottom - always visible */}
        <div className="flex-shrink-0 bg-gray-900 text-white p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            {/* Track info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center flex-shrink-0">
                {currentSong?.cover_image ? (
                  <img 
                    src={currentSong.cover_image} 
                    alt={currentSong.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M212.92,25.69a8,8,0,0,0-6.86-1.45L80.08,50.12a8,8,0,0,0-6.85,6.86L48.11,182a8,8,0,0,0,6.86,9.14l125-25.89a8,8,0,0,0,6.85-6.86l25.12-125A8,8,0,0,0,212.92,25.69Z"/>
                  </svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">
                  {currentSong?.title || 'No track selected'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {currentSong?.artist || 'Ready to play'}
                </div>
              </div>
            </div>
            
            {/* Playback controls */}
            <div className="flex items-center space-x-2 mx-4">
              <button 
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                onClick={playPrevious}
                disabled={!currentSong || songs.findIndex(song => song.id === currentSong.id) === 0}
                title="Previous"
              >
                <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M200,32V224a8,8,0,0,1-16,0V47.36L51.87,128,184,208.64a8,8,0,0,0,16,0V32A8,8,0,0,0,200,32Z"/>
                </svg>
              </button>
              <button 
                className="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-full transition-colors disabled:opacity-50"
                onClick={playPause}
                disabled={!currentSong && songs.length === 0}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M216,48V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h32A16,16,0,0,1,216,48ZM88,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H88a16,16,0,0,0,16-16V48A16,16,0,0,0,88,32Z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"/>
                  </svg>
                )}
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                onClick={playNext}
                disabled={!currentSong || songs.findIndex(song => song.id === currentSong.id) === songs.length - 1}
                title="Next"
              >
                <svg className="w-4 h-4" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M72,32V224a8,8,0,0,1-16,0V47.36L204.13,128,72,208.64a8,8,0,0,0-16,0V32A8,8,0,0,0,72,32Z"/>
                </svg>
              </button>
            </div>
            
            {/* Volume control */}
            <div className="flex items-center space-x-2 flex-1 min-w-0 justify-end">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 256 256" fill="currentColor">
                <path d="M199.81,25a16,16,0,0,0-12.9,6.41L148.6,80H88A16,16,0,0,0,72,96v64a16,16,0,0,0,16,16h60.6l38.31,48.59A16,16,0,0,0,212,216V40A16,16,0,0,0,199.81,25Z"/>
              </svg>
              <div 
                className="w-20 h-1 bg-gray-700 rounded-full cursor-pointer"
                onClick={handleVolumeChange}
                title={`Volume: ${Math.round(volume * 100)}%`}
              >
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-150"
                  style={{ width: `${volume * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div 
              className="w-full h-1 bg-gray-700 rounded-full cursor-pointer"
              onClick={handleSeek}
              title="Seek"
            >
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-150"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resize handles - positioned at edges and corners - only show when not maximized */}
      {!windowState.isMaximized && (
        <>
          <div className="resize-top absolute top-0 left-2 right-2 h-1 cursor-ns-resize bg-transparent hover:bg-purple-500 hover:bg-opacity-30 transition-colors"></div>
          <div className="resize-bottom absolute bottom-0 left-2 right-2 h-1 cursor-ns-resize bg-transparent hover:bg-purple-500 hover:bg-opacity-30 transition-colors"></div>
          <div className="resize-left absolute left-0 top-2 bottom-2 w-1 cursor-ew-resize bg-transparent hover:bg-purple-500 hover:bg-opacity-30 transition-colors"></div>
          <div className="resize-right absolute right-0 top-2 bottom-2 w-1 cursor-ew-resize bg-transparent hover:bg-purple-500 hover:bg-opacity-30 transition-colors"></div>
          
          {/* Corner resize handles */}
          <div className="resize-top resize-left absolute top-0 left-0 w-2 h-2 cursor-nw-resize bg-transparent hover:bg-purple-500 hover:bg-opacity-50 transition-colors"></div>
          <div className="resize-top resize-right absolute top-0 right-0 w-2 h-2 cursor-ne-resize bg-transparent hover:bg-purple-500 hover:bg-opacity-50 transition-colors"></div>
          <div className="resize-bottom resize-left absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize bg-transparent hover:bg-purple-500 hover:bg-opacity-50 transition-colors"></div>
          <div className="resize-bottom resize-right absolute bottom-0 right-0 w-2 h-2 cursor-se-resize bg-transparent hover:bg-purple-500 hover:bg-opacity-50 transition-colors"></div>
        </>
      )}
    </div>
  );
};

export default MusicWindow;

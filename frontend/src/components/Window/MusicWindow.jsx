// src/components/Window/MusicWindow.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import interact from 'interactjs';
import axiosClient from '../../api/axiosClient';

const MusicWindow = ({ onClose, onFocus, zIndex = 40, onMinimize, isMinimized = false }) => {
  const windowRef = useRef(null);
  const audioRef = useRef(null);
  const canvas3Ref = useRef(null); // Third canvas for song list mini visualizer
  const smoothedHeights3Ref = useRef(new Array(5).fill(2)); // Persistent smoothing for song list mini visualizer (5 bars)
  const animation3Ref = useRef(null); // Third animation for song list mini visualizer
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const lastPlayedSongIdRef = useRef(null); // Track last played song ID to prevent unnecessary reloads
  
  const [windowState, setWindowState] = useState({
    x: 200,
    y: 120,
    width: 750,
    height: 500,
    isMaximized: false
  });

  // Store original state for restore
  const [originalState, setOriginalState] = useState({
    x: 200,
    y: 120,
    width: 750,
    height: 500
  });

  // Music player state
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [previousVolume, setPreviousVolume] = useState(0.5); // Store previous volume for unmute
  const [isMuted, setIsMuted] = useState(false); // Track mute state separately
  const [isDraggingVolume, setIsDraggingVolume] = useState(false); // Track volume drag state
  const [isDraggingProgress, setIsDraggingProgress] = useState(false); // Track progress drag state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Panel resizing state
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // Percentage
  const [isDraggingPanelDivider, setIsDraggingPanelDivider] = useState(false);
  
  const progressBarRef = useRef(null);

  // Audio Visualizer Functions
  const initializeVisualizer = useCallback(() => {
    const audio = audioRef.current;
    
    console.log('initializeVisualizer called', { audio: !!audio });
    
    if (!audio) return;

    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Created audio context');
      }

      const audioContext = audioContextRef.current;

      // Create analyser if it doesn't exist
      if (!analyserRef.current) {
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 256; // This gives us 128 frequency bins
        console.log('Created analyser');
      }

      const analyser = analyserRef.current;

      // Create source if it doesn't exist or if audio source changed
      if (!sourceRef.current) {
        sourceRef.current = audioContext.createMediaElementSource(audio);
        sourceRef.current.connect(analyser);
        analyser.connect(audioContext.destination);
        console.log('Created audio source and connected');
      }

      const canvas3 = canvas3Ref.current;
      if (canvas3) {
        startVisualization3();
      }
    } catch (error) {
      console.error('Error initializing audio visualizer:', error);
    }
  }, []);

  // Third visualization for song list - mini-sized with 5 bars and low-pass filter
  const startVisualization3 = useCallback(() => {
    const canvas3 = canvas3Ref.current;
    const analyser = analyserRef.current;
    
    if (!canvas3 || !analyser) return;

    // Set fixed canvas size like mini visualizer
    canvas3.width = 32;
    canvas3.height = 16;

    const canvasContext3 = canvas3.getContext('2d');
    const frequencyBufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(frequencyBufferLength);
    
    // Use only 5 bars for ultra-compact display
    const numBars = 5;
    
    // Use persistent smoothing array (5 elements for 5 bars)
    const smoothedHeights = smoothedHeights3Ref.current;

    const draw3 = () => {
      if (!canvas3Ref.current) return;

      animation3Ref.current = requestAnimationFrame(draw3);
      
      // Clear canvas
      canvasContext3.clearRect(0, 0, 32, 16);

      // Get frequency data
      analyser.getByteFrequencyData(frequencyData);

      // Calculate bar dimensions for 5 bars
      const barWidth = canvas3.width / numBars;
      const barHeightScale = canvas3.height / 255; // Same logic as second visualizer

      // Apply low-pass filter: Use only the lower 4/5 of frequencies (cut top 1/5)
      const lowPassCutoff = Math.floor(frequencyBufferLength * 0.8); // Use only 80% of frequencies
      
      // Draw 5 bars using low-pass filtered frequency data with temporal smoothing
      for (let i = 0; i < numBars; i++) {
        // Map each bar to a section of the low-pass filtered frequency range
        const dataIndex = Math.floor((i / numBars) * lowPassCutoff);
        // Same height logic as second visualizer
        let targetHeight = frequencyData[dataIndex] * barHeightScale;
        
        // Apply temporal smoothing - same as other visualizers
        const smoothingFactor = 0.2;
        smoothedHeights[i] = smoothedHeights[i] * (1 - smoothingFactor) + targetHeight * smoothingFactor;
        
        // Ensure minimum visible height
        const barHeight = Math.max(1, smoothedHeights[i]);
        
        // Create gradient color - purple theme to match music player
        const hue = 270; // Purple color
        canvasContext3.fillStyle = `hsl(${hue}, 70%, 60%)`;
        
        // Draw bar from bottom, centered with small gap between bars
        const barGap = 0.5;
        const x = i * barWidth + barGap;
        const y = canvas3.height - barHeight;
        
        canvasContext3.fillRect(x, y, barWidth - barGap, barHeight);
      }
    };

    draw3();
  }, []);

  const stopVisualization = useCallback(() => {
    if (animation3Ref.current) {
      cancelAnimationFrame(animation3Ref.current);
      animation3Ref.current = null;
    }
  }, []);

  // Initialize visualizer when audio starts playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      // Resume audio context if suspended
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      initializeVisualizer();
    };

    const handlePause = () => {
      stopVisualization();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, [initializeVisualizer, stopVisualization]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      // canvas2 has fixed size, no need to resize
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      stopVisualization();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopVisualization]);

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
    const updateDuration = () => {
      const newDuration = audio.duration;
      if (newDuration && !isNaN(newDuration)) {
        setDuration(newDuration);
      }
    };
    const handleCanPlay = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleLoadedData = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
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
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('error', handleError);
    };
  }, [currentSong, songs]);

  // Update audio volume - use actual volume or 0 if muted - apply immediately
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Auto-play when a new song is selected
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    // Only reload and reset if the song ID actually changed
    if (lastPlayedSongIdRef.current === currentSong.id) {
      return; // Same song, don't reset
    }

    // Update the last played song ID
    lastPlayedSongIdRef.current = currentSong.id;

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
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
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
    // Prevent all event propagation
    event.preventDefault();
    event.stopPropagation();
    
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    
    // Use the duration from state if audio.duration is not available
    const audioDuration = audio.duration || duration;
    
    // Check if audio is loaded enough to seek
    if (audio.readyState < 1 && !audioDuration) { // HAVE_METADATA
      return;
    }
    
    if (!audioDuration || audioDuration === 0 || isNaN(audioDuration)) {
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const newTime = percent * audioDuration;
    
    try {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const handleProgressMouseDown = (event) => {
    // This function will now handle both clicks and the start of a drag.
    event.preventDefault();
    
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar || !currentSong) return;

    // Use the duration from state if audio.duration is not available
    const audioDuration = audio.duration || duration;
    if (!audioDuration || audioDuration === 0 || isNaN(audioDuration)) return;

    // Immediately seek to the clicked position
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const newTime = percent * audioDuration;
    
    try {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } catch (error) {
      console.error('Error seeking audio:', error);
      return;
    }

    // Now, prepare for a potential drag
    setIsDraggingProgress(true);

    const handleMouseMove = (moveEvent) => {
      const movePercent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
      const moveNewTime = movePercent * audioDuration;
      try {
        audio.currentTime = moveNewTime;
        setCurrentTime(moveNewTime);
      } catch (error) {
        console.error('Error seeking during drag:', error);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsDraggingProgress(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleProgressMouseMove = (event) => {
    if (isDraggingProgress) {
      const progressBar = event.currentTarget.closest('.progress-bar');
      if (progressBar) {
        const audio = audioRef.current;
        if (!audio || !currentSong || audio.readyState < 2) return;
        
        const rect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const newTime = percent * audio.duration;
        
        try {
          audio.currentTime = newTime;
          setCurrentTime(newTime);
        } catch (error) {
          console.error('Error seeking audio during drag:', error);
        }
      }
    }
  };

  const handleProgressMouseUp = () => {
    setIsDraggingProgress(false);
  };

  const handleVolumeChange = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    
    // If user is adjusting volume, unmute automatically
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    
    // Store previous volume if we're setting a valid volume
    if (newVolume > 0) {
      setPreviousVolume(newVolume);
    }
    
    setVolume(newVolume);
    
    // Apply volume immediately to audio element
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, [isMuted]);

  const handleVolumeMouseDown = (event) => {
    setIsDraggingVolume(true);
    handleVolumeChange(event);
  };

  const handleVolumeMouseMove = (event) => {
    if (isDraggingVolume) {
      const volumeSlider = event.currentTarget.closest('.volume-slider');
      if (volumeSlider) {
        const rect = volumeSlider.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const newVolume = Math.max(0, Math.min(1, percent));
        
        // If user is adjusting volume, unmute automatically
        if (isMuted && newVolume > 0) {
          setIsMuted(false);
        }
        
        // Store previous volume if we're setting a valid volume
        if (newVolume > 0) {
          setPreviousVolume(newVolume);
        }
        
        setVolume(newVolume);
        
        // Apply volume immediately to audio element
        if (audioRef.current) {
          audioRef.current.volume = newVolume;
        }
      }
    }
  };

  const handleVolumeMouseUp = () => {
    setIsDraggingVolume(false);
  };

  // Add global mouse event listeners for volume dragging
  useEffect(() => {
    if (isDraggingVolume) {
      const handleGlobalMouseMove = (event) => {
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
          const rect = volumeSlider.getBoundingClientRect();
          const percent = (event.clientX - rect.left) / rect.width;
          const newVolume = Math.max(0, Math.min(1, percent));
          
          // If user is adjusting volume, unmute automatically
          if (isMuted && newVolume > 0) {
            setIsMuted(false);
          }
          
          // Store previous volume if we're setting a valid volume
          if (newVolume > 0) {
            setPreviousVolume(newVolume);
          }
          
          setVolume(newVolume);
          
          // Apply volume immediately to audio element
          if (audioRef.current) {
            audioRef.current.volume = newVolume;
          }
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDraggingVolume(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDraggingVolume, isMuted]);

  const handleMuteToggle = useCallback(() => {
    if (isMuted) {
      // Unmute: restore previous volume
      setIsMuted(false);
      // Apply volume immediately to audio element
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    } else {
      // Mute: store current volume and mute
      if (volume > 0) {
        setPreviousVolume(volume);
      }
      setIsMuted(true);
      // Apply mute immediately to audio element
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  }, [isMuted, volume]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Panel divider drag handlers
  const handlePanelDividerMouseDown = (event) => {
    event.preventDefault();
    setIsDraggingPanelDivider(true);

    const handleMouseMove = (moveEvent) => {
      const windowElement = windowRef.current;
      if (!windowElement) return;

      const rect = windowElement.getBoundingClientRect();
      const contentArea = windowElement.querySelector('.panel-container');
      if (!contentArea) return;

      const contentRect = contentArea.getBoundingClientRect();
      const relativeX = moveEvent.clientX - contentRect.left;
      const newPercentage = (relativeX / contentRect.width) * 100;

      // Constrain between 20% and 80% for usability
      const constrainedPercentage = Math.max(20, Math.min(80, newPercentage));
      setLeftPanelWidth(constrainedPercentage);
    };

    const handleMouseUp = () => {
      setIsDraggingPanelDivider(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Add global mouse event listeners for panel dragging
  useEffect(() => {
    if (isDraggingPanelDivider) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingPanelDivider]);

  // Cleanup audio context when component unmounts
  useEffect(() => {
    return () => {
      stopVisualization();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopVisualization]);

  // Function to get the appropriate speaker icon based on volume level and mute state
  const getSpeakerIcon = (volumeLevel, muted) => {
    if (muted) {
      // Muted - speaker with X
      return (
        <button 
          onClick={handleMuteToggle}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="Unmute"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-white transition-colors" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
            <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z"/>
            <line x1="240" y1="104" x2="192" y2="152"/>
            <line x1="240" y1="152" x2="192" y2="104"/>
            <line x1="80" y1="88" x2="80" y2="168"/>
          </svg>
        </button>
      );
    } else if (volumeLevel <= 0.33) {
      // Low volume - speaker only
      return (
        <button 
          onClick={handleMuteToggle}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="Mute"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-white transition-colors" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
            <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z"/>
            <line x1="80" y1="88" x2="80" y2="168"/>
          </svg>
        </button>
      );
    } else if (volumeLevel <= 0.66) {
      // Medium volume - speaker with one wave
      return (
        <button 
          onClick={handleMuteToggle}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="Mute"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-white transition-colors" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
            <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z"/>
            <line x1="80" y1="88" x2="80" y2="168"/>
            <path d="M192,106.85a32,32,0,0,1,0,42.3"/>
          </svg>
        </button>
      );
    } else {
      // High volume - speaker with two waves
      return (
        <button 
          onClick={handleMuteToggle}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="Mute"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-white transition-colors" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
            <path d="M80,168H32a8,8,0,0,1-8-8V96a8,8,0,0,1,8-8H80l72-56V224Z"/>
            <line x1="80" y1="88" x2="80" y2="168"/>
            <path d="M192,106.85a32,32,0,0,1,0,42.3"/>
            <path d="M221.67,80a72,72,0,0,1,0,96"/>
          </svg>
        </button>
      );
    }
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
        allowFrom: '#music-window .window-title-bar',
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
        // Resize from specific edges and corners only - use ID-specific selectors
        edges: {
          left: '#music-window .resize-left',
          right: '#music-window .resize-right', 
          bottom: '#music-window .resize-bottom',
          top: '#music-window .resize-top'
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
            newWidth = Math.max(600, newWidth);
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
            min: { width: 600, height: 400 }
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
        allowFrom: '#music-window .window-title-bar',
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
            
            // Calculate boundaries - keep fully on screen
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
          left: '#music-window .resize-left',
          right: '#music-window .resize-right', 
          bottom: '#music-window .resize-bottom',
          top: '#music-window .resize-top'
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
            min: { width: 600, height: 400 }
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
                min: { width: 600, height: 400 }
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
    <>
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(147, 51, 234, 0.6) rgba(147, 51, 234, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(147, 51, 234, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(147, 51, 234, 0.8) 0%, rgba(126, 34, 206, 0.8) 50%, rgba(107, 33, 168, 0.8) 100%);
          border-radius: 10px;
          border: 1px solid rgba(147, 51, 234, 0.2);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(147, 51, 234, 1) 0%, rgba(126, 34, 206, 1) 50%, rgba(107, 33, 168, 1) 100%);
          box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.3), 0 0 6px rgba(147, 51, 234, 0.4);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, rgba(107, 33, 168, 1) 0%, rgba(147, 51, 234, 1) 100%);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .custom-scrollbar-dark {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.6) rgba(31, 41, 55, 0.3);
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(156, 163, 175, 0.8) 0%, rgba(107, 114, 128, 0.8) 50%, rgba(75, 85, 99, 0.8) 100%);
          border-radius: 10px;
          border: 1px solid rgba(156, 163, 175, 0.2);
          box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1);
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(147, 51, 234, 0.9) 0%, rgba(126, 34, 206, 0.9) 50%, rgba(107, 33, 168, 0.9) 100%);
          box-shadow: inset 0 1px 3px rgba(255, 255, 255, 0.2), 0 0 6px rgba(147, 51, 234, 0.3);
        }
        
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, rgba(107, 33, 168, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .panel-divider {
          width: 4px;
          background: linear-gradient(to right, 
            rgba(156, 163, 175, 0.1) 0%, 
            rgba(156, 163, 175, 0.3) 20%, 
            rgba(156, 163, 175, 0.4) 50%, 
            rgba(156, 163, 175, 0.3) 80%, 
            rgba(156, 163, 175, 0.1) 100%
          );
          cursor: col-resize;
          transition: all 0.2s ease;
          position: relative;
          flex-shrink: 0;
        }
        
        .panel-divider:hover {
          background: linear-gradient(to right, 
            rgba(156, 163, 175, 0.2) 0%, 
            rgba(156, 163, 175, 0.4) 20%, 
            rgba(156, 163, 175, 0.6) 50%, 
            rgba(156, 163, 175, 0.4) 80%, 
            rgba(156, 163, 175, 0.2) 100%
          );
          box-shadow: 0 0 6px rgba(156, 163, 175, 0.3);
        }
        
        .panel-divider:active,
        .panel-divider.dragging {
          background: linear-gradient(to right, 
            rgba(107, 114, 128, 0.3) 0%, 
            rgba(107, 114, 128, 0.5) 20%, 
            rgba(107, 114, 128, 0.7) 50%, 
            rgba(107, 114, 128, 0.5) 80%, 
            rgba(107, 114, 128, 0.3) 100%
          );
          box-shadow: 0 0 8px rgba(107, 114, 128, 0.4);
        }
        
        .panel-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 1px;
          height: 16px;
          background: rgba(156, 163, 175, 0.5);
          border-radius: 0.5px;
          transition: all 0.2s ease;
        }
        
        .panel-divider:hover::before {
          background: rgba(107, 114, 128, 0.7);
          height: 24px;
          box-shadow: 0 0 3px rgba(107, 114, 128, 0.3);
        }
      `}</style>
      <div
        ref={windowRef}
        id="music-window"
        className={`absolute bg-white border border-gray-300 overflow-hidden select-none flex flex-col ${windowState.isMaximized ? '' : 'rounded-lg'} ${isMinimized ? 'hidden' : ''}`}
        style={{
          width: `${windowState.width}px`,
          height: `${windowState.height}px`,
          minWidth: '600px',
          minHeight: '400px',
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
            <svg className="w-3 h-3" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
              <circle cx="180" cy="164" r="28"/>
              <circle cx="52" cy="196" r="28"/>
              <line x1="208" y1="72" x2="80" y2="104"/>
              <polyline points="80 196 80 56 208 24 208 164"/>
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
          crossOrigin="anonymous"
        />
        
        {/* Main content area - scrollable */}
        <div className="flex-1 overflow-hidden p-6">
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
                  <svg className="w-8 h-8" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="16">
                    <circle cx="128" cy="128" r="96"/>
                    <line x1="128" y1="136" x2="128" y2="80" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="128" cy="172" r="12" fill="currentColor"/>
                  </svg>
                </div>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="flex h-full panel-container">
              {/* Left Panel - Song Info */}
              <div 
                className="flex flex-col"
                style={{ width: `${leftPanelWidth}%` }}
              >
                {/* Currently Playing Section */}
                {currentSong ? (
                  <div className="bg-gradient-to-r from-purple-100 to-purple-200 pl-6 pt-6 pb-6 rounded-l-lg h-full flex flex-col">
                    <h3 className="text-lg font-semibold text-purple-800 mb-4 flex-shrink-0">Now Playing</h3>
                    
                    <div className="flex flex-col items-center text-center flex-1 overflow-y-auto custom-scrollbar">
                      {/* Large Album Art */}
                      <div className="w-48 h-48 bg-purple-600 rounded-lg flex items-center justify-center mb-6 shadow-lg flex-shrink-0">
                        {currentSong.cover_image ? (
                          <img 
                            src={currentSong.cover_image} 
                            alt={currentSong.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <svg className="w-24 h-24 text-white" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                            <circle cx="180" cy="164" r="28"/>
                            <circle cx="52" cy="196" r="28"/>
                            <line x1="208" y1="72" x2="80" y2="104"/>
                            <polyline points="80 196 80 56 208 24 208 164"/>
                          </svg>
                        )}
                      </div>
                      
                      {/* Song Details */}
                      <div className="mb-6 flex-shrink-0">
                        <h4 className="text-2xl font-bold text-purple-900 mb-2 break-words">{currentSong.title}</h4>
                        <p className="text-lg text-purple-700 mb-1 break-words">{currentSong.artist || 'Unknown Artist'}</p>
                        <p className="text-purple-600 break-words">
                          {currentSong.album || 'Unknown Album'} 
                          {currentSong.release_date && (
                            <span> • {new Date(currentSong.release_date).getFullYear()}</span>
                          )}
                        </p>
                      </div>
                      
                      {/* Additional Song Info */}
                      <div className="text-sm text-purple-600 space-y-1 flex-shrink-0">
                        <div>Duration: {formatTime(duration || 0)}</div>
                        {currentSong.genre && <div>Genre: {currentSong.genre}</div>}
                        {currentSong.file_size && (
                          <div>File Size: {(currentSong.file_size / (1024 * 1024)).toFixed(1)} MB</div>
                        )}
                        {currentSong.bitrate && (
                          <div>Bitrate: {currentSong.bitrate} kbps</div>
                        )}
                        {currentSong.sample_rate && (
                          <div>Sample Rate: {currentSong.sample_rate} Hz</div>
                        )}
                        {currentSong.description && (
                          <div className="mt-4 p-3 bg-purple-50 rounded text-left">
                            <strong>Description:</strong>
                            <p className="mt-1">{currentSong.description}</p>
                          </div>
                        )}
                        {currentSong.lyrics && (
                          <div className="mt-4 p-3 bg-purple-50 rounded text-left">
                            <strong>Lyrics:</strong>
                            <pre className="mt-1 whitespace-pre-wrap font-sans text-sm">{currentSong.lyrics}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 pl-6 pt-6 pb-6 rounded-l-lg h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-12 h-12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                        <circle cx="180" cy="164" r="28"/>
                        <circle cx="52" cy="196" r="28"/>
                        <line x1="208" y1="72" x2="80" y2="104"/>
                        <polyline points="80 196 80 56 208 24 208 164"/>
                      </svg>
                    </div>
                    <p className="text-lg">Select a song to play</p>
                  </div>
                )}
              </div>
              
              {/* Panel Divider */}
              <div 
                className={`panel-divider ${isDraggingPanelDivider ? 'dragging' : ''}`}
                onMouseDown={handlePanelDividerMouseDown}
                title="Drag to resize panels"
              ></div>
              
              {/* Right Panel - Songs List */}
              <div 
                className="flex flex-col pl-3"
                style={{ width: `${100 - leftPanelWidth}%` }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">Music Library</h2>
                {songs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                        <circle cx="180" cy="164" r="28"/>
                        <circle cx="52" cy="196" r="28"/>
                        <line x1="208" y1="72" x2="80" y2="104"/>
                        <polyline points="80 196 80 56 208 24 208 164"/>
                      </svg>
                    </div>
                    <p>No songs in your library</p>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar-dark">
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
                          {currentSong?.id === song.id ? (
                            <canvas
                              ref={canvas3Ref}
                              className="w-8 h-4"
                              style={{ display: 'block' }}
                            />
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
                            <svg className="w-5 h-5 text-purple-600" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                              <circle cx="180" cy="164" r="28"/>
                              <circle cx="52" cy="196" r="28"/>
                              <line x1="208" y1="72" x2="80" y2="104"/>
                              <polyline points="80 196 80 56 208 24 208 164"/>
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
        <div className="flex-shrink-0 bg-gray-900 text-white p-4 border-t border-gray-700" onClick={(e) => e.stopPropagation()}>
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
                  <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                    <circle cx="180" cy="164" r="28"/>
                    <circle cx="52" cy="196" r="28"/>
                    <line x1="208" y1="72" x2="80" y2="104"/>
                    <polyline points="80 196 80 56 208 24 208 164"/>
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
                <svg className="w-4 h-4" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                  <line x1="56" y1="40" x2="56" y2="216"/>
                  <path d="M200,47.88V208.12a8,8,0,0,1-12.19,6.65L59.7,134.65a7.83,7.83,0,0,1,0-13.3L187.81,41.23A8,8,0,0,1,200,47.88Z"/>
                </svg>
              </button>
              <button 
                className="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-full transition-colors disabled:opacity-50"
                onClick={playPause}
                disabled={!currentSong && songs.length === 0}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                    <rect x="152" y="40" width="56" height="176" rx="8"/>
                    <rect x="48" y="40" width="56" height="176" rx="8"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                    <path d="M72,39.88V216.12a8,8,0,0,0,12.15,6.69l144.08-88.12a7.82,7.82,0,0,0,0-13.38L84.15,33.19A8,8,0,0,0,72,39.88Z"/>
                  </svg>
                )}
              </button>
              <button 
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
                onClick={playNext}
                disabled={!currentSong || songs.findIndex(song => song.id === currentSong.id) === songs.length - 1}
                title="Next"
              >
                <svg className="w-4 h-4" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16">
                  <line x1="200" y1="40" x2="200" y2="216"/>
                  <path d="M56,47.88V208.12a8,8,0,0,0,12.19,6.65L196.3,134.65a7.83,7.83,0,0,0,0-13.3L68.19,41.23A8,8,0,0,0,56,47.88Z"/>
                </svg>
              </button>
            </div>
            
            {/* Volume control */}
            <div className="flex items-center space-x-2 flex-1 min-w-0 justify-end">
              {getSpeakerIcon(volume, isMuted)}
              <div 
                className="volume-slider w-20 h-1 bg-gray-700 rounded-full cursor-pointer relative group"
                onMouseDown={handleVolumeMouseDown}
                title={isMuted ? `Muted (${Math.round(volume * 100)}%)` : `Volume: ${Math.round(volume * 100)}%`}
              >
                <div 
                  className={`h-full rounded-full ${isMuted ? 'bg-gray-500' : 'bg-purple-500'}`}
                  style={{ width: `${volume * 100}%` }}
                ></div>
                {/* Volume handle */}
                <div 
                  className={`absolute top-1/2 w-3 h-3 rounded-full transform -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 ${isMuted ? 'bg-gray-500' : 'bg-purple-500'} ${isDraggingVolume ? 'opacity-100 scale-110' : ''}`}
                  style={{ left: `calc(${volume * 100}% - 6px)` }}
                  title={isMuted ? `Muted (${Math.round(volume * 100)}%)` : `${Math.round(volume * 100)}%`}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div 
              ref={progressBarRef}
              className="progress-bar w-full h-2 bg-gray-700 rounded-full cursor-pointer hover:bg-gray-600 transition-colors relative group"
              onMouseDown={handleProgressMouseDown}
              title={`${formatTime(currentTime)} / ${formatTime(duration)}`}
            >
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-150 group-hover:bg-purple-400"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
              {/* Progress handle - show when hovering or dragging */}
              <div 
                className={`absolute top-1/2 w-3 h-3 bg-purple-500 rounded-full transform -translate-y-1/2 -translate-x-1/2 transition-opacity pointer-events-none ${
                  isDraggingProgress ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
                }`}
                style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
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
          {/* Top and bottom resize bars with fade effect */}
          <div 
            className="resize-top absolute top-0 left-6 right-6 h-0.5 cursor-ns-resize bg-transparent hover:bg-purple-600 hover:bg-opacity-40 transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to right, transparent, rgba(147, 51, 234, 0.4) 20%, rgba(147, 51, 234, 0.4) 80%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-bottom absolute bottom-0 left-6 right-6 h-0.5 cursor-ns-resize bg-transparent hover:bg-purple-600 hover:bg-opacity-40 transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to right, transparent, rgba(147, 51, 234, 0.4) 20%, rgba(147, 51, 234, 0.4) 80%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          
          {/* Left and right resize bars with fade effect */}
          <div 
            className="resize-left absolute left-0 top-6 bottom-6 w-0.5 cursor-ew-resize bg-transparent hover:bg-purple-600 hover:bg-opacity-40 transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to bottom, transparent, rgba(147, 51, 234, 0.4) 20%, rgba(147, 51, 234, 0.4) 80%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-right absolute right-0 top-6 bottom-6 w-0.5 cursor-ew-resize bg-transparent hover:bg-purple-600 hover:bg-opacity-40 transition-colors"
            style={{
              background: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(to bottom, transparent, rgba(147, 51, 234, 0.4) 20%, rgba(147, 51, 234, 0.4) 80%, transparent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          
          {/* Corner resize handles - quarter circles */}
          <div 
            className="resize-top resize-left absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-transparent hover:bg-purple-600 hover:bg-opacity-50 transition-colors"
            style={{
              background: 'transparent',
              borderBottomRightRadius: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(147, 51, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-top resize-right absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-transparent hover:bg-purple-600 hover:bg-opacity-50 transition-colors"
            style={{
              background: 'transparent',
              borderBottomLeftRadius: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(147, 51, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-bottom resize-left absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-transparent hover:bg-purple-600 hover:bg-opacity-50 transition-colors"
            style={{
              background: 'transparent',
              borderTopRightRadius: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(147, 51, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
          <div 
            className="resize-bottom resize-right absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-transparent hover:bg-purple-600 hover:bg-opacity-50 transition-colors"
            style={{
              background: 'transparent',
              borderTopLeftRadius: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(147, 51, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          ></div>
        </>
      )}
    </div>
    </>
  );
};

export default MusicWindow;

// frontend/src/components/Clock.jsx
import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('America/New_York');
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);

  // Common timezones with friendly names, sorted by GMT offset
  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (ICT)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Asia/Chongqing', label: 'Shanxi (CST)' }
  ];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load saved timezone from localStorage on component mount
  useEffect(() => {
    const savedTimezone = localStorage.getItem('selectedTimezone');
    if (savedTimezone && timezones.find(tz => tz.value === savedTimezone)) {
      setSelectedTimezone(savedTimezone);
    } else {
      // Try to detect user's timezone
      try {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (timezones.find(tz => tz.value === userTimezone)) {
          setSelectedTimezone(userTimezone);
        }
      } catch (error) {
        console.log('Could not detect timezone, using default');
      }
    }
  }, []);

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
    localStorage.setItem('selectedTimezone', timezone);
    setShowTimezoneSelector(false);
  };

  const formatTime = (date, timezone) => {
    try {
      return date.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getTimezoneDisplay = (timezone) => {
    // Return the specific timezone abbreviations we want to show
    if (timezone === 'UTC') return 'UTC';
    if (timezone === 'Asia/Ho_Chi_Minh') return 'ICT';
    if (timezone === 'Asia/Shanghai') return 'CST';
    if (timezone === 'Asia/Chongqing') return 'CST';
    
    // Fallback to system-generated abbreviation
    try {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts(currentTime);
      const timeZonePart = parts.find(part => part.type === 'timeZoneName');
      return timeZonePart ? timeZonePart.value : '';
    } catch (error) {
      return '';
    }
  };

  const selectedTimezoneLabel = timezones.find(tz => tz.value === selectedTimezone)?.label || selectedTimezone;

  return (
    <div className="relative">
      <button
        onClick={() => setShowTimezoneSelector(!showTimezoneSelector)}
        className="flex flex-col items-center text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200 px-2 py-1 rounded hover:bg-gray-100"
        title={`Click to change timezone (Currently: ${selectedTimezoneLabel})`}
      >
        <span className="font-semibold">
          {formatTime(currentTime, selectedTimezone)}
        </span>
        <span className="text-xs opacity-75">
          {getTimezoneDisplay(selectedTimezone)}
        </span>
      </button>

      {showTimezoneSelector && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowTimezoneSelector(false)}
          ></div>
          
          {/* Timezone Selector Dropdown */}
          <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-700">Select Timezone</h3>
            </div>
            <div className="py-1">
              {timezones.map((timezone) => (
                <button
                  key={timezone.value}
                  onClick={() => handleTimezoneChange(timezone.value)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors ${
                    selectedTimezone === timezone.value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{timezone.label}</span>
                    <span className="text-xs opacity-60">
                      {formatTime(currentTime, timezone.value)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Clock;

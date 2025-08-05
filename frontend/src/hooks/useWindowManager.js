// src/hooks/useWindowManager.js
import { useState, useCallback } from 'react';

export const useWindowManager = () => {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [zIndexCounter, setZIndexCounter] = useState(1000);

  const openWindow = useCallback((windowConfig) => {
    const newWindow = {
      id: Date.now() + Math.random(),
      title: windowConfig.title || 'New Window',
      component: windowConfig.component,
      icon: windowConfig.icon,
      position: windowConfig.position || { x: 100, y: 100 },
      size: windowConfig.size || { width: 800, height: 600 },
      isMaximized: false,
      isMinimized: false,
      zIndex: zIndexCounter,
      ...windowConfig
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setZIndexCounter(prev => prev + 1);
    
    return newWindow.id;
  }, [zIndexCounter]);

  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    setActiveWindowId(prev => prev === windowId ? null : prev);
  }, []);

  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  }, []);

  const maximizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const restoreWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: false } : w
    ));
    setActiveWindowId(windowId);
  }, []);

  const focusWindow = useCallback((windowId) => {
    setActiveWindowId(windowId);
    setZIndexCounter(prev => {
      const newZIndex = prev + 1;
      setWindows(current => current.map(w => 
        w.id === windowId ? { ...w, zIndex: newZIndex } : w
      ));
      return newZIndex;
    });
  }, []);

  const updateWindowPosition = useCallback((windowId, position) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, position } : w
    ));
  }, []);

  const updateWindowSize = useCallback((windowId, size) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, size } : w
    ));
  }, []);

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize
  };
};

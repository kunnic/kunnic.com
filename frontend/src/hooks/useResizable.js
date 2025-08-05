// src/hooks/useResizable.js
import { useState, useCallback, useEffect } from 'react';

export const useResizable = (initialSize = { width: 800, height: 600 }, onSizeChange) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const handleResizeStart = useCallback((e, direction) => {
    if (e.button !== 0) return;
    
    setIsResizing(true);
    setResizeDirection(direction);
    setStartMousePos({ x: e.clientX, y: e.clientY });
    setStartSize(size);
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !resizeDirection) return;

    const deltaX = e.clientX - startMousePos.x;
    const deltaY = e.clientY - startMousePos.y;
    
    const minWidth = 300;
    const minHeight = 200;
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight;

    let newSize = { ...startSize };

    // Calculate new size based on resize direction
    if (resizeDirection.includes('right')) {
      newSize.width = Math.max(minWidth, Math.min(startSize.width + deltaX, maxWidth));
    }
    if (resizeDirection.includes('left')) {
      newSize.width = Math.max(minWidth, Math.min(startSize.width - deltaX, maxWidth));
    }
    if (resizeDirection.includes('bottom')) {
      newSize.height = Math.max(minHeight, Math.min(startSize.height + deltaY, maxHeight));
    }
    if (resizeDirection.includes('top')) {
      newSize.height = Math.max(minHeight, Math.min(startSize.height - deltaY, maxHeight));
    }

    setSize(newSize);
    onSizeChange?.(newSize);
  }, [isResizing, resizeDirection, startMousePos, startSize, onSizeChange]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = `${resizeDirection}-resize`;

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp, resizeDirection]);

  return {
    size,
    isResizing,
    handleResizeStart
  };
};

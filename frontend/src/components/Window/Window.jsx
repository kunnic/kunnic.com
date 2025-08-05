// Base Window component
import React, { useEffect, useRef } from 'react';
import interact from 'interactjs';

function Window({ 
  title, 
  children, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onRestore,
  onFocus,
  isMinimized = false, 
  isMaximized = false,
  isFocused = false,
  zIndex = 40,
  initialWidth = 800,
  initialHeight = 600,
  initialX = 100,
  initialY = 100
}) {
  const windowRef = useRef(null);
  const dragHandleRef = useRef(null);

  useEffect(() => {
    const windowElement = windowRef.current;
    const dragHandle = dragHandleRef.current;

    if (!windowElement || !dragHandle) return;

    // Set initial position and size
    windowElement.style.width = `${initialWidth}px`;
    windowElement.style.height = `${initialHeight}px`;
    windowElement.style.left = `${initialX}px`;
    windowElement.style.top = `${initialY}px`;

    // Make window draggable and resizable
    interact(windowElement)
      .draggable({
        allowFrom: dragHandle,
        listeners: {
          move(event) {
            if (isMaximized) return; // Don't allow drag when maximized
            
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // Boundary constraints
            const rect = target.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height - 60; // Account for taskbar

            const constrainedX = Math.max(0, Math.min(x, maxX));
            const constrainedY = Math.max(0, Math.min(y, maxY));

            target.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
            target.setAttribute('data-x', constrainedX);
            target.setAttribute('data-y', constrainedY);
          }
        }
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            if (isMaximized) return; // Don't allow resize when maximized
            
            const target = event.target;
            let x = parseFloat(target.getAttribute('data-x')) || 0;
            let y = parseFloat(target.getAttribute('data-y')) || 0;

            // Update size
            target.style.width = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';

            // Update position
            x += event.deltaRect.left;
            y += event.deltaRect.top;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        },
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 300, height: 200 }
          })
        ]
      });

    return () => {
      interact(windowElement).unset();
    };
  }, [isMaximized, initialWidth, initialHeight, initialX, initialY]);

  // Handle maximize/restore
  useEffect(() => {
    const windowElement = windowRef.current;
    if (!windowElement) return;

    if (isMaximized) {
      windowElement.style.width = '100vw';
      windowElement.style.height = 'calc(100vh - 60px)'; // Account for taskbar
      windowElement.style.left = '0';
      windowElement.style.top = '0';
      windowElement.style.transform = 'translate(0px, 0px)';
      windowElement.style.borderRadius = '0';
    } else {
      windowElement.style.borderRadius = '12px';
    }
  }, [isMaximized]);

  if (isMinimized) {
    return null;
  }

  return (
    <div
      ref={windowRef}
      className={`absolute bg-white shadow-2xl border border-gray-200 ${
        isMaximized ? '' : 'rounded-xl'
      } overflow-hidden`}
      style={{ 
        zIndex,
        boxShadow: isFocused ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
      }}
      onClick={onFocus}
    >
      {/* Title Bar */}
      <div
        ref={dragHandleRef}
        className={`bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between select-none cursor-move ${
          isFocused ? 'from-blue-50 to-blue-100 border-blue-200' : ''
        }`}
      >
        <div className="flex items-center space-x-3">
          {/* Window Controls */}
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="w-3 h-3 bg-red-500 hover:bg-red-600 rounded-full focus:outline-none"
              title="Close"
            />
            <button
              onClick={onMinimize}
              className="w-3 h-3 bg-yellow-500 hover:bg-yellow-600 rounded-full focus:outline-none"
              title="Minimize"
            />
            <button
              onClick={isMaximized ? onRestore : onMaximize}
              className="w-3 h-3 bg-green-500 hover:bg-green-600 rounded-full focus:outline-none"
              title={isMaximized ? "Restore" : "Maximize"}
            />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default Window;

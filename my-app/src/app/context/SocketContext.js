// context/SocketContext.js

'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageHandlersRef = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    console.log('Initializing socket connection...');
    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // Expose socket instance globally for direct access
    window.socket = socketInstance;

    socketInstance.on('connect', () => {
      console.log('[🔌 Socket] Connected:', socketInstance.id);
      setIsConnected(true);
      window.socketConnected = true;
    });

    socketInstance.on('disconnect', () => {
      console.log('[🔌 Socket] Disconnected');
      setIsConnected(false);
      window.socketConnected = false;
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[🔌 Socket] Connection error:', err.message);
      setIsConnected(false);
      window.socketConnected = false;
    });

    // Register debug listeners for ALL socket events
    const debugEvents = (socket) => {
      // Original handlers
      const originalOn = socket.on;
      const originalEmit = socket.emit;
      
      // Override emit to log all outgoing messages
      socket.emit = function(event, ...args) {
        console.log(`[🔍 DEBUG EMIT] ${event}:`, ...args);
        return originalEmit.apply(this, [event, ...args]);
      };
      
      // Add universal event listener
      socket.onAny((event, ...args) => {
        console.log(`[🔍 DEBUG RECEIVE] ${event}:`, ...args);
      });
      
      return socket;
    };
    
    // Apply debug wrappers
    debugEvents(socketInstance);

    // Handle all socket events
    socketInstance.onAny((event, ...args) => {
      console.log(`[📥 Socket] Event received: ${event}`, args);
      
      // Direct handling for ride-confirmed event
      if (event === 'ride-confirmed' || 
          (event === 'message' && args[0]?.event === 'ride-confirmed')) {
        
        const data = event === 'ride-confirmed' ? args[0] : args[0];
        console.log('[🚗 Socket] Ride confirmation detected:', data);
        
        // Extract normalized driver data
        const driverData = data?.driver || (data?.data?.driver);
        console.log('[🚗 Socket] Driver data extracted:', driverData);
        
        // Check if driver data is available
        if (!driverData) {
          console.warn('[🚗 Socket] No driver data found in event:', data);
        }
        
        // Call global handler if available
        if (window.handleGlobalRideConfirmation) {
          console.log('[🚗 Socket] Calling global handler');
          try {
            window.handleGlobalRideConfirmation(data);
          } catch (error) {
            console.error('[🚗 Socket] Error in global handler:', error);
          }
        }
        
        // Also dispatch DOM event for redundancy
        try {
          // Include the full data for processing
          document.dispatchEvent(new CustomEvent('ride-confirmed-dom', {
            detail: data
          }));
          console.log('[🚗 Socket] DOM event dispatched');
          
          // Additionally, ensure component-specific event is triggered
          window.dispatchEvent(new CustomEvent('rideconfirmed', {
            detail: data
          }));
          console.log('[🚗 Socket] Window ride event dispatched');
        } catch (error) {
          console.error('[🚗 Socket] Error dispatching DOM event:', error);
        }
      }
      
      // Check if this is a 'message' event
      if (event === 'message') {
        const data = args[0];
        const messageHandlers = messageHandlersRef.current['message'] || [];
        
        // Call all message handlers
        messageHandlers.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error('[⚠️ Error] Message handler error:', error);
          }
        });
      }
      
      // Call any registered handlers for this specific event
      const eventHandlers = messageHandlersRef.current[event] || [];
      eventHandlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`[⚠️ Error] ${event} handler error:`, error);
        }
      });
    });

    setSocket(socketInstance);

    return () => {
      console.log('[🔌 Socket] Cleaning up socket connection');
      if (socketInstance) {
        socketInstance.disconnect();
      }
      window.socket = null;
      window.socketConnected = false;
    };
  }, []);

  const sendMessage = (event, data) => {
    if (!socket) {
      console.error('[📤 Socket] Socket not initialized');
      return;
    }
    if (!isConnected) {
      console.error('[📤 Socket] Socket not connected');
      return;
    }
    console.log(`[📤 Socket] Sending: ${event}`, data);
    socket.emit(event, data);
  };

  const receivemessage = (event, handler) => {
    if (!handler || typeof handler !== 'function') {
      console.error('[📥 Socket] Invalid handler provided');
      return;
    }
    
    console.log(`[📥 Socket] Listening for event: ${event}`);
    
    // Store handler in ref to avoid issues with closures
    messageHandlersRef.current[event] = messageHandlersRef.current[event] || [];
    messageHandlersRef.current[event].push(handler);
    
    // Return cleanup function
    return () => {
      if (messageHandlersRef.current[event]) {
        messageHandlersRef.current[event] = messageHandlersRef.current[event].filter(h => h !== handler);
      }
    };
  };

  // Always ensure the socket is exposed
  const contextValue = {
    socket,
    isConnected,
    sendMessage,
    receivemessage
  };

  // Add socket instance listeners for important events
  useEffect(() => {
    if (!socket) return;
    
    console.log('[🔧 Setup] Adding direct listeners to socket instance');
    
    // Special handler for ride-confirmed events
    const rideConfirmedHandler = (data) => {
      console.log('[🚗 Socket] Direct ride-confirmed event received:', data);
      
      // Debug deep inspection of data structure
      console.log('[🚨 DEBUG] Data type:', typeof data);
      console.log('[🚨 DEBUG] Contains driver?', !!data?.driver);
      if (data?.driver) {
        console.log('[🚨 DEBUG] Driver fullname type:', typeof data.driver.fullname);
        console.log('[🚨 DEBUG] Driver vehicle type:', typeof data.driver.vehicle);
      }
      
      // Emit to all possible channels to maximize chance of reception
      
      // 1. Re-emit as original event to ensure all listeners catch it
      socket.emit('ride-confirmed', data);
      
      // 2. Re-emit as message for compatibility
      socket.emit('message', {
        event: 'ride-confirmed',
        data: data
      });
      
      // 3. Dispatch DOM events
      try {
        // Custom event for components to catch
        document.dispatchEvent(new CustomEvent('ride-confirmed-dom', {
          detail: data
        }));
        
        // Legacy event format
        window.dispatchEvent(new CustomEvent('rideconfirmed', {
          detail: data
        }));
        
        // Direct update event
        document.dispatchEvent(new CustomEvent('forceRideUpdate', { 
          detail: { 
            driverDetails: data?.driver || data, 
            rideStage: 'confirmed' 
          } 
        }));
      } catch (error) {
        console.error('[🚗 Socket] Error dispatching DOM events:', error);
      }
    };
    
    // Add special handlers
    socket.on('ride-confirmed', rideConfirmedHandler);
    
    // Also listen for message events containing ride confirmations
    socket.on('message', (data) => {
      if (data?.event === 'ride-confirmed') {
        console.log('[🚗 Socket] Detected ride-confirmed in message:', data);
        rideConfirmedHandler(data.data || data);
      }
    });
    
    return () => {
      // Clean up event listeners
      socket.off('ride-confirmed', rideConfirmedHandler);
      socket.off('message');
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

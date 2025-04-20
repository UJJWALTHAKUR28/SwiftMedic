// context/SocketContext.js

'use client';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

// Debug logger for socket events
const debugSocket = (message, data) => {
  console.log(`🔌 ${message}`, data);
};

// Enhanced version of receivemessage - define this outside the component
function enhancedReceiveMessage(event, callback) {
  debugSocket(`SOCKET REGISTER: Setting up listener for event: ${event}`, {});
  
  // Get the socket instance
  const socket = window.socket;
  
  if (!socket) {
    console.error(`🔌 SOCKET ERROR: Socket not available when trying to listen for ${event}`);
    return false;
  }
  
  // First remove any existing listeners to prevent duplicates
  socket.off(event);
  
  // Add the new listener with debug logging
  socket.on(event, (data) => {
    debugSocket(`SOCKET EVENT: ${event} received`, data);
    
    // Special handling for critical events
    if (event === 'ride-ended') {
      debugSocket('CRITICAL EVENT: ride-ended received', data);
      
      // Create and dispatch DOM event as direct backup
      const rideEndedEvent = new CustomEvent('rideEnded', {
        detail: {
          rideEnded: true,
          ride: data,
          timestamp: new Date().toISOString()
        }
      });
      
      document.dispatchEvent(rideEndedEvent);
      
      // Try BroadcastChannel as another backup
      try {
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('ride_events');
          bc.postMessage({
            event: 'ride-ended',
            data: data,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error with BroadcastChannel:', err);
      }
      
      // Force a global flag for polling detection
      window.rideEndedReceived = true;
    }
    
    // Execute the callback
    if (typeof callback === 'function') {
      try {
        callback(data);
      } catch (error) {
        console.error(`🔌 SOCKET ERROR: Error in ${event} callback:`, error);
      }
    }
  });
  
  debugSocket(`SOCKET READY: Listening for event: ${event}`, {});
  return true;
}

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
      
      // Direct handling for ride-started event
      if (event === 'ride-started' || 
          (event === 'message' && args[0]?.event === 'ride-started')) {
        
        const data = event === 'ride-started' ? args[0] : args[0].data;
        console.log('[🚙 Socket] Ride started detected:', data);
        
        // Store ride data in localStorage for the Riding page
        try {
          // Store the essential ride data
          const rideToStore = {
            _id: data._id,
            pickup: data.pickup,
            destination: data.destination,
            fare: data.fare,
            status: 'ongoing'
          };
          
          // Store ride data and driver details
          localStorage.setItem('currentRide', JSON.stringify(rideToStore));
          
          if (data.driver || data.ambulancedriver) {
            localStorage.setItem('driverDetails', JSON.stringify(data.driver || data.ambulancedriver));
          }
          
          console.log('[🚙 Socket] Stored ride data, redirecting to /Riding');
        } catch (error) {
          console.error('[🚙 Socket] Error storing ride data:', error);
        }
        
        // Force navigation to Riding page
        console.log('[🚙 Socket] IMMEDIATE REDIRECT TO /RIDING');
        window.location.href = '/Riding';
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

  const receivemessage = (event, callback) => {
    return enhancedReceiveMessage(event, callback);
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
    
    // Special handler for ride-started events
    const rideStartedHandler = (data) => {
      console.log('[🚗 Socket] Direct ride-started event received:', data);
      
      // Store ride data in localStorage for the Riding page
      try {
        // Store the essential ride data
        const rideToStore = {
          _id: data._id,
          pickup: data.pickup,
          destination: data.destination,
          fare: data.fare,
          status: 'ongoing'
        };
        
        // Store ride data and driver details
        localStorage.setItem('currentRide', JSON.stringify(rideToStore));
        
        if (data.driver || data.ambulancedriver) {
          localStorage.setItem('driverDetails', JSON.stringify(data.driver || data.ambulancedriver));
        }
        
        console.log('[🚗 Socket] Stored ride data in localStorage, redirecting to /Riding');
      } catch (error) {
        console.error('[🚗 Socket] Error storing ride data:', error);
      }
      
      // Force navigation to Riding page
      console.log('[🚗 Socket] Forcing navigation to /Riding');
      window.location.href = '/Riding';
    };
    
    // Add special handlers
    socket.on('ride-confirmed', rideConfirmedHandler);
    socket.on('ride-started', rideStartedHandler);
    
    // Also listen for message events containing important events
    socket.on('message', (data) => {
      if (data?.event === 'ride-confirmed') {
        console.log('[🚗 Socket] Detected ride-confirmed in message:', data);
        rideConfirmedHandler(data.data || data);
      }
      
      if (data?.event === 'ride-started') {
        console.log('[🚗 Socket] Detected ride-started in message:', data);
        rideStartedHandler(data.data || data);
      }
    });
    
    return () => {
      // Clean up event listeners
      socket.off('ride-confirmed', rideConfirmedHandler);
      socket.off('ride-started', rideStartedHandler);
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

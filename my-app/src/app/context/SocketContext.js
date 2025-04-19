"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messageHandlers, setMessageHandlers] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected with ID:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    // Handle incoming messages
    socketInstance.on('message', (data) => {
      console.log('Received message:', data);
      if (data.event && messageHandlers[data.event]) {
        messageHandlers[data.event](data.data);
      }
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const sendMessage = (event, data) => {
    if (!socket) {
      console.error('Socket instance not initialized');
      return;
    }
    if (!isConnected) {
      console.error('Socket not connected');
      return;
    }
    console.log(`Emitting ${event}:`, data);
    socket.emit(event, data);
  };

  const receivemessage = (event, handler) => {
    if (!socket) return;
    
    console.log(`Listening for event: ${event}`);
    socket.on(event, handler);
    return () => socket.off(event, handler);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage, receivemessage }}>
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
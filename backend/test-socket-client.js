// test-socket-client.js
const { io } = require('socket.io-client');

const socket = io('http://localhost:4000');

socket.on('connect', () => {
    console.log('[CLIENT] Connected to server:', socket.id);
    socket.emit('message', { text: 'Hello from test client' });
});

socket.on('welcome', (data) => {
    console.log('[CLIENT] Welcome message:', data);
});

socket.on('message_received', (data) => {
    console.log('[CLIENT] Message ack from server:', data);
});

socket.on('disconnect', () => {
    console.log('[CLIENT] Disconnected');
});

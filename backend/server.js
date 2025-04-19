const http = require('http');
const app = require('./App'); // Keeping './App' as you requested
const { initializeSocket } = require('./socket');

const PORT = process.env.PORT || 3000;

// Create the server first
const server = http.createServer(app);

// Initialize socket with the server
const io = initializeSocket(server);

// Then start listeninag
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`🔌 Socket.IO initialized`);
});

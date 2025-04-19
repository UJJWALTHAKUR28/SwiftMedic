// socket.js
const socketIO = require('socket.io');
const userModel = require('./models/user.model');
const driverModel = require('./models/ambulancedriver.model');
const rideModel = require('./models/ride.model');
let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('join', async (data) => {
            const { userId, userType } = data;
            console.log(`${userType} ${userId} joining...`);
            
            if (userType === 'user') {
                try {
                    await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
                    console.log(`User ${userId} joined as ${userType}`);
                } catch (error) {
                    console.error('Error updating user:', error);
                }
            } else if (userType === 'ambulancedriver') {
                try {
                    await driverModel.findByIdAndUpdate(userId, { 
                        socketId: socket.id,
                        status: 'available'
                    });
                    console.log(`Driver ${userId} joined as ${userType}`);
                } catch (error) {
                    console.error('Error updating driver:', error);
                }
            }
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
        socket.emit('welcome', { message: 'Connected successfully!' });
        

        socket.on('update-location-driver', async (data) => {
            const { userId, userType, location } = data;
            console.log('Received location update:', {
                userId,
                userType,
                location,
                socketId: socket.id
            });

            if (userType === 'ambulancedriver') {
                try {
                    // Validate location data
                    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
                        console.error('Invalid location data:', location);
                        socket.emit('error', { message: 'Invalid location data' });
                        return;
                    }

                    // Update the driver's location
                    const updatedDriver = await driverModel.findByIdAndUpdate(
                        userId,
                        {
                            $set: {
                                location: {
                                    lat: location.lat,
                                    lng: location.lng
                                }
                            }
                        },
                        { new: true }
                    );

                    console.log('Driver after location update:', {
                        id: updatedDriver._id,
                        newLocation: updatedDriver.location,
                        vehicleType: updatedDriver.vehicle?.type
                    });

                    // Verify the update
                    const verifyDriver = await driverModel.findById(userId);
                    console.log('Verification - Driver location in database:', verifyDriver.location);

                } catch (error) {
                    console.error('Error updating driver location:', error);
                    socket.emit('error', { message: 'Failed to update location' });
                }
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
        
        // Handle other socket events here
        socket.on('message', (data) => {
            console.log('Message received:', data);
            // Process message
            socket.emit('message_received', { status: 'ok' });
        });
    });
    
    return io;
};

const sendMessageToSocketId = (socketId, message) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return false;
    }
    
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
        console.log('Sending message to socket:', socketId, message);
        socket.emit('message', message);
        return true;
    } else {
        console.log(`Socket ${socketId} not found`);
        return false;
    }
};

module.exports = {
    initializeSocket,
    sendMessageToSocketId
};
const { validationResult } = require('express-validator');
const rideService = require('../services/ride.service');
const { sendMessageToSocketId } = require('../socket');
const mapService = require('../services/map.service');
const ambulancedriverModel = require('../models/ambulancedriver.model');
const rideModel = require('../models/ride.model');
const { json } = require('express');
const userModel = require('../models/user.model');

module.exports.createRide = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    try {
        // Create the ride first
        const ride = await rideService.createRide({
            user: req.user._id,
            pickup,
            destination,
            vehicleType
        });
        console.log('Creating ride with:', {
            pickup,
            destination,
            vehicleType
        });
        // Get pickup coordinates with fallback
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        console.log('Pickup coordinates:', pickupCoordinates);
        
        // Find nearby drivers
        const driversInRadius = await mapService.getdriverRadius(
            pickupCoordinates.lat,
            pickupCoordinates.lng,
            10,
            vehicleType
        );

        console.log(`Found ${driversInRadius.length} nearby drivers`);

        // Populate user info for the ride notification
        const rideWithUser = await rideModel.findOne({ _id: ride._id })
            .populate('user', 'fullname email phonenumber');

        // Remove sensitive info before sending notification
        const rideNotification = {
            ...rideWithUser.toObject(),
            otp: undefined // Remove OTP from notification
        };

        // Send notifications to nearby drivers
        let notificationsSent = 0;
        driversInRadius.forEach(driver => {
            if (driver.socketId) {
                console.log(`Sending ride notification to driver ${driver._id} at socket ${driver.socketId}`);
                const notificationSent = sendMessageToSocketId(driver.socketId, {
                    event: 'new-ride',
                    data: rideNotification
                });
                if (notificationSent) {
                    notificationsSent++;
                }
            }
        });

        console.log(`Sent notifications to ${notificationsSent} drivers`);

        // Return success response with ride details
        res.status(201).json({
            ...ride,
            notificationsSent
        });
        
    } catch (error) {
        console.error('Error creating ride:', error);
        res.status(500).json({ error: 'Failed to create ride' });
    }
};

module.exports.getFare = async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    // Change from req.body to req.query since parameters are sent in URL
    const {pickup, destination} = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);  // Changed status to 200 for successful response
    } catch(err) {
        console.error('Fare calculation error:', err);
        return res.status(500).json({
            message: err.message || 'Error calculating fare',
            error: err.stack
        });
    }
}
module.exports.confirmRide = async (req, res) => {
  console.log('confirmRide controller triggered with:', { 
    rideId: req.body.rideId,
    user: req.user._id,
    userType: req.user.constructor.modelName || 'Unknown'
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;
  
  if (!rideId) {
    return res.status(400).json({ message: "Ride ID is required" });
  }

  try {
    // Ensure we have a valid driver object
    if (!req.user || !req.user._id) {
      return res.status(400).json({ message: "Invalid driver information" });
    }
    
    // Call ride service with driver details
    const ride = await rideService.confirmRide({ 
      rideId, 
      ambulancedriver: req.user 
    });

    if (!ride.user || !ride.user.socketId) {
      console.warn('No valid socketId found for user:', ride.user);
    }

    // Get driver details to send with notification
    const driverInfo = {
      _id: req.user._id,
      fullname: req.user.fullname,
      vehicle: req.user.vehicle,
      phone: req.user.phonenumber || req.user.phone
    };

    // Prepare notification data
    const notificationData = {
      driver: driverInfo,
      rideId: ride._id,
      otp: ride.otp || null  // Include OTP in notification
    };

    console.log("Sending ride confirmation to user's socket:", ride.user.socketId);

    // Send direct message to user
    if (ride.user && ride.user.socketId) {
      sendMessageToSocketId(ride.user.socketId, {
        event: 'ride-confirmed',
        data: notificationData
      });
    } else {
      console.warn('No socket ID available for notification');
    }
    
    // Also broadcast to all connected clients (as a backup)
    try {
      const socketModule = require('../socket');
      if (socketModule && socketModule.io) {
        socketModule.io.emit('message', {
          event: 'ride-confirmed',
          data: notificationData
        });
        console.log('Broadcast notification sent successfully');
      } else {
        console.warn('Socket.io instance not available for broadcast');
      }
    } catch (socketError) {
      console.warn('Error broadcasting via socket.io:', socketError.message);
      // Continue with response - don't let socket errors fail the API
    }

    return res.status(200).json({
      message: 'Ride confirmed successfully',
      ride: {
        _id: ride._id,
        status: ride.status,
        otp: ride.otp,
        user: ride.user ? ride.user._id : null,
        ambulancedriver: ride.ambulancedriver ? ride.ambulancedriver._id : null,
        notificationData
      }
    });
  } catch (err) {
    console.error('Ride confirmation error:', err);
    return res.status(500).json({ 
      message: err.message || 'Failed to confirm ride'
    });
  }
};
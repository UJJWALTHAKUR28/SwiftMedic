const rideService = require('../services/ride.service');
const {validationResult} = require('express-validator');
const mapService = require('../services/map.service');
const ambulancedriverModel = require('../models/ambulancedriver.model');
const {sendMessageToSocketId} = require('../socket')
const rideModel = require('../models/ride.model');

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
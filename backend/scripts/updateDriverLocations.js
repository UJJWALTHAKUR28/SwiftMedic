const mongoose = require('mongoose');
const driverModel = require('../models/ambulancedriver.model');
require('dotenv').config();

async function updateDriverLocations() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to database');

        // Find all drivers with ltd field
        const drivers = await driverModel.find({ 'location.ltd': { $exists: true } });
        console.log(`Found ${drivers.length} drivers with ltd field`);

        for (const driver of drivers) {
            if (driver.location && driver.location.ltd) {
                // Update to use lat instead of ltd
                await driverModel.updateOne(
                    { _id: driver._id },
                    {
                        $set: {
                            'location.lat': driver.location.ltd
                        },
                        $unset: {
                            'location.ltd': 1
                        }
                    }
                );
                console.log(`Updated driver ${driver._id}`);
            }
        }

        // Also find drivers with missing lat field
        const driversMissingLat = await driverModel.find({
            'location.lat': { $exists: false },
            'location.lng': { $exists: true }
        });
        console.log(`Found ${driversMissingLat.length} drivers missing lat field`);

        for (const driver of driversMissingLat) {
            if (driver.location && driver.location.lng) {
                // Set a default lat value (you might want to adjust this)
                await driverModel.updateOne(
                    { _id: driver._id },
                    {
                        $set: {
                            'location.lat': 0
                        }
                    }
                );
                console.log(`Added lat field to driver ${driver._id}`);
            }
        }

        console.log('All drivers updated successfully');
    } catch (error) {
        console.error('Error updating drivers:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
}

// Run the update
updateDriverLocations(); 
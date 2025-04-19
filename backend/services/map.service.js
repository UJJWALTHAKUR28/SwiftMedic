const drivermodel =require('../models/ambulancedriver.model');
const { vehicleMapping } = require('./ride.service');
const DEFAULT_ADDRESSES = {
    DELHI: {
        address: "AIIMS Hospital, New Delhi, India",
        coordinates: { lat: 30.6139, lng: 74.2090 },
        distance: {
            value: 5000,  // 5km in meters
            text: "5 km"
        },
        duration: {
            value: 900,   // 15 minutes in seconds
            text: "15 mins"
        }
    },
    MUMBAI: {
        address: "Lilavati Hospital, Mumbai, India",
        coordinates: { lat: 19.0760, lng: 72.8777 },
        distance: {
            value: 7000,
            text: "7 km"
        },
        duration: {
            value: 1200,
            text: "20 mins"
        }
    },
    BANGALORE: {
        address: "Manipal Hospital, Bangalore, India",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        distance: {
            value: 6000,
            text: "6 km"
        },
        duration: {
            value: 1080,
            text: "18 mins"
        }
    }
};
module.exports.getAddressCoordinate = async(address)=>{
    try {
        const apiKey = process.env.YOUR_GOOGLE_MAPS_API_KEY;
        const encodedAddress = encodeURIComponent(address);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                isDefault: false
            };
        } else {
            // Return default coordinates based on city name
            const cityMatch = address.toLowerCase();
            if (cityMatch.includes('delhi')) {
                return { ...DEFAULT_ADDRESSES.DELHI.coordinates, isDefault: true };
            } else if (cityMatch.includes('mumbai')) {
                return { ...DEFAULT_ADDRESSES.MUMBAI.coordinates, isDefault: true };
            } else if (cityMatch.includes('bangalore')) {
                return { ...DEFAULT_ADDRESSES.BANGALORE.coordinates, isDefault: true };
            }
            return { ...DEFAULT_ADDRESSES.DELHI.coordinates, isDefault: true };
        }
    } catch (error) {
        return { ...DEFAULT_ADDRESSES.DELHI.coordinates, isDefault: true };
    }
}

module.exports.getdriverRadius = async (lat, lng, radius, vehicleType) => {
    try {
        // First, let's see ALL drivers in the system
        const allDrivers = await drivermodel.find({});
        console.log('ALL DRIVERS IN SYSTEM:', allDrivers.map(d => ({
            id: d._id,
            location: d.location,
            vehicleType: d.vehicle?.type,
            hasLocation: d.location?.lat && d.location?.lng ? 'yes' : 'no'
        })));

        // Now let's check drivers with location
        const driversWithLocation = await drivermodel.find({
            'location.lat': { $exists: true },
            'location.lng': { $exists: true }
        });
        console.log('DRIVERS WITH LOCATION:', driversWithLocation.map(d => ({
            id: d._id,
            location: d.location,
            vehicleType: d.vehicle?.type
        })));

        // Now let's check drivers with matching vehicle type
        const compatibleVehicleTypes = vehicleType ? vehicleMapping[vehicleType] || [] : [];
        const driversWithVehicleType = await drivermodel.find({
            'vehicle.type': { $in: compatibleVehicleTypes }
        });
        console.log('DRIVERS WITH MATCHING VEHICLE TYPE:', driversWithVehicleType.map(d => ({
            id: d._id,
            vehicleType: d.vehicle?.type,
            location: d.location
        })));

        // Original search logic
        const query = {
            'location.lat': { $exists: true },
            'location.lng': { $exists: true },
            'vehicle.type': { $in: compatibleVehicleTypes }
        };

        const availableDrivers = await drivermodel.find(query);
        
        // Filter by distance
        const driversInRadius = availableDrivers.filter(driver => {
            if (!driver.location?.lat || !driver.location?.lng) return false;
            
            const distance = calculateDistance(
                lat, lng,
                driver.location.lat,
                driver.location.lng
            );
            console.log(`Distance for driver ${driver._id}: ${distance}km`);
            return distance <= radius;
        });

        return driversInRadius;
    } catch (error) {
        console.error('Error in getdriverRadius:', error);
        return [];
    }
};

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Fix the if condition in getDistanceTime
module.exports.getDistanceTime = async (origin, destination) => {
    // Fix the condition (remove the || and add proper check)
    if(!origin || !destination) {  // Changed from if(!origin||destination)
        throw new Error('Origin and destination are required');
    }
    
    try {
        const apiKey = process.env.YOUR_GOOGLE_MAPS_API_KEY;
        const encodedOrigin = encodeURIComponent(origin);
        const encodedDestination = encodeURIComponent(destination);
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodedOrigin}&destinations=${encodedDestination}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.rows.length > 0 && data.rows[0].elements.length > 0) {
            const element = data.rows[0].elements[0];
            if (element.status === 'OK') {
                return {
                    distance: element.distance,
                    duration: element.duration,
                    isDefault: false
                };
            }
        }
        
        // Return default values if API call fails
        
        
    } catch (error) {
        // Return default values if error occurs
        
    }
};
function getDefaultDistanceTime(origin, destination) {
    // Helper function to determine city from address
    const getCity = (address) => {
        address = address.toLowerCase();
        if (address.includes('delhi')) return 'DELHI';
        if (address.includes('mumbai')) return 'MUMBAI';
        if (address.includes('bangalore')) return 'BANGALORE';
        return 'DELHI'; // Default to Delhi
    };

    const originCity = getCity(origin);
    const destinationCity = getCity(destination);

    // If same city, use default values
    if (originCity === destinationCity) {
        return {
            distance: DEFAULT_ADDRESSES[originCity].distance,
            duration: DEFAULT_ADDRESSES[originCity].duration,
            isDefault: true
        };
    }

    // For inter-city, calculate based on fixed values
    return {
        distance: {
            value: 15000, // 15km default
            text: "15 km"
        },
        duration: {
            value: 1800, // 30 minutes default
            text: "30 mins"
        },
        isDefault: true
    };
}
module.exports.getAutoCompletesuggestions=async(input)=> {
    if(!input){
        throw new Error('query is required');
    }

    try {
        const apiKey = process.env.YOUR_GOOGLE_MAPS_API_KEY; // Replace with your actual API key
        const encodedInput = encodeURIComponent(input);
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodedInput}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.predictions.length > 0) {
            return data.predictions.map(prediction => ({
                description: prediction.description,
                placeId: prediction.place_id
            }));
        } else {
            throw new Error('No autocomplete suggestions found for the given input');
        }
    } catch (error) {
        throw new Error(`Error getting autocomplete suggestions: ${error.message}`);
    }
}


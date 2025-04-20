const { send } = require('process');
const ambulancedriverModel = require('../models/ambulancedriver.model');
const rideModel = require('../models/ride.model');
const mapService =require('./map.service')
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendMessageToSocketId } = require('../socket');


const vehicleMapping = {
  swiftbasic: ['Basic Life Support (BLS)', 'Non-Emergency Medical Transport (NEMT)', 'Patient Transport Ambulances'],
  swiftexpress: ['Basic Life Support (BLS)', 'Non-Emergency Medical Transport (NEMT)', 'Patient Transport Ambulances','Advanced Life Support (ALS)', 'Critical Care Transport', 'Neonatal Ambulance', 'Pediatric Ambulance','Mobile Intensive Care Unit (MICU)', 'Air Ambulance', 'Rescue Ambulance', 'Fire Rescue Ambulance', 'Community Paramedicine Ambulance', 'Event Medical Services'],
  swiftrange: ['Mobile Intensive Care Unit (MICU)', 'Air Ambulance', 'Rescue Ambulance', 'Fire Rescue Ambulance', 'Community Paramedicine Ambulance', 'Event Medical Services'],
};
module.exports.vehicleMapping = vehicleMapping;
async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error('Pickup and destination are required');
  }
  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  

  const baseFare = {
    swiftbasic: 50,
    swiftexpress: 100,
    swiftrange: 150,
  };

  const perKmRate = {
    swiftbasic: 10,
    swiftexpress: 15,
    swiftrange: 20,
  };

  const perMinuteRate = {
    swiftbasic: 2,
    swiftexpress: 3,
    swiftrange: 5,
  };
  const fare = {
    swiftbasic:Math.round( baseFare.swiftbasic + (((distanceTime.distance.value)/1000) * perKmRate.swiftbasic) + (((distanceTime.duration.value)/60) * perMinuteRate.swiftbasic)),
    swiftexpress: Math.round(baseFare.swiftexpress + (((distanceTime.distance.value)/1000) * perKmRate.swiftexpress) + (((distanceTime.duration.value)/60) * perMinuteRate.swiftexpress)),
    swiftrange: Math.round(baseFare.swiftrange + (((distanceTime.distance.value)/1000) * perKmRate.swiftrange) + (((distanceTime.duration.value)/60) * perMinuteRate.swiftrange)),
  };

  return fare;
}
module.exports.getFare =getFare;
function getOTP(num) {
  if (!num || num <= 0) {
    throw new Error('Number of digits must be greater than 0');
  }
  const otp = crypto.randomInt(0, Math.pow(10, num)).toString().padStart(num, '0');
  return otp;
}


module.exports.createRide = async({user, pickup, destination, vehicleType}) => {
  if(!user || !pickup || !destination || !vehicleType) {
      throw new Error('All fields are required');
  }

  try {
      // Get fare and distance/time info
      const fare = await getFare(pickup, destination);
      const distanceTime = await mapService.getDistanceTime(pickup, destination);
      
      // Create ride with fallback values if needed
      const ride = await rideModel.create({
          user,
          pickup,
          destination,
          fare: fare[vehicleType.toLowerCase()],
          otp: getOTP(6),
          
      });

      console.log('Current vehicle mappings:', vehicleMapping);
      console.log('Requested vehicle type:', vehicleType);
      console.log('Compatible types for requested vehicle:', vehicleMapping[vehicleType]);

      return ride;
  } catch (error) {
      
      throw error;
  }
};
module.exports.confirmRide = async ({ rideId, ambulancedriver }) => {
  console.log('confirmRide service triggered with:', { 
    rideId, 
    driverId: ambulancedriver._id,
    driverInfo: ambulancedriver
  }); 

  if (!rideId || !ambulancedriver) {
    throw new Error("Ride ID and ambulance driver are required");
  }

  try {
    // First verify ride exists
    const rideExists = await rideModel.findById(rideId);
    if (!rideExists) {
      throw new Error('Ride not found');
    }
    console.log('Found ride to update:', rideExists._id);

    // Update ride status with explicit MongoDB query
    const updateResult = await rideModel.findByIdAndUpdate(
      rideId,
      {
        $set: {
          status: 'accepted',
          ambulancedriver: ambulancedriver._id
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );
    
    console.log('Update result:', updateResult ? 'Success' : 'Failed');

    // Now fetch the updated ride with populated fields and include OTP
    const ride = await rideModel.findById(rideId)
      .populate({
        path: 'user',
        select: 'fullname email socketId'
      })
      .populate({
        path: 'ambulancedriver',
        select: 'fullname vehicle phonenumber'
      })
      .select('+otp'); // Add this to include the OTP

    if (!ride) {
      throw new Error('Failed to retrieve updated ride');
    }

    console.log('Ride updated successfully:', {
      id: ride._id,
      status: ride.status,
      otp: ride.otp,
      driverId: ride.ambulancedriver?._id || null
    });
    
    return ride;
  } catch (error) {
    console.error('Error updating ride:', error);
    throw error;
  }
};

module.exports.startRide = async ({ rideId, ambulancedriver, otp }) => {
  console.log('startRide service triggered with:', { 
    rideId, 
    driverId: ambulancedriver._id,
    otp
  }); 

  if (!rideId || !ambulancedriver || !otp) {
    throw new Error("Ride ID, ambulance driver, and OTP are required");
  }

  try {
    const ride = await rideModel.findOne({_id:rideId
    }).populate('user').populate('ambulancedriver').select('+otp');
    if (!ride) {
      throw new Error('Ride not found');
    }
    if(ride.status !== 'accepted'){
      throw new Error('Ride is not in accepted status');
    }
    if (ride.otp !== otp) {
      throw new Error('Invalid OTP');
    }
    await rideModel.findOneAndUpdate({_id:rideId}, {
        status: 'ongoing',
    });
    sendMessageToSocketId(ride.user.socketId,{
      event:'ride-started',
      data:ride
    })
    return ride;
    // First verify ride exists
  }catch (error) {
    console.error('Error starting ride:', error);
    throw error;
  }
}

module.exports.endRide = async ({ rideId, ambulancedriver }) => {
  console.log('endRide service triggered with:', { 
    rideId, 
    driverId: ambulancedriver._id
  }); 

  if (!rideId || !ambulancedriver) {
    throw new Error("Ride ID and ambulance driver are required");
  }

  try {
    const ride = await rideModel.findOne({_id:rideId,
      ambulancedriver:ambulancedriver._id
    }).populate('user').populate('ambulancedriver');
    if (!ride) {
      throw new Error('Ride not found');
    }
    if(ride.status !== 'ongoing'){
      throw new Error('Ride is not in ongoing status');
    }
    await rideModel.findOneAndUpdate({_id:rideId}, {
        status: 'completed',
    });
    sendMessageToSocketId(ride.user.socketId,{
      event:'ride-ended',
      data:ride
    })
    return ride;
  } catch (error) {
    console.error('Error ending ride:', error);
    throw error;
  }
}
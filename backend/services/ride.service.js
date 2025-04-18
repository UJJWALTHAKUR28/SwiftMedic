const rideModel = require('../models/ride.model');
const mapService =require('./map.service')
const bcrypt = require('bcrypt');

async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error('Pickup and destination are required');
  }
  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  const vehicleMapping = {
    swiftbasic: ['Basic Life Support (BLS)', 'Non-Emergency Medical Transport (NEMT)', 'Patient Transport Ambulances'],
    swiftexpress: ['Basic Life Support (BLS)', 'Non-Emergency Medical Transport (NEMT)', 'Patient Transport Ambulances','Advanced Life Support (ALS)', 'Critical Care Transport', 'Neonatal Ambulance', 'Pediatric Ambulance','Mobile Intensive Care Unit (MICU)', 'Air Ambulance', 'Rescue Ambulance', 'Fire Rescue Ambulance', 'Community Paramedicine Ambulance', 'Event Medical Services'],
    swiftrange: ['Mobile Intensive Care Unit (MICU)', 'Air Ambulance', 'Rescue Ambulance', 'Fire Rescue Ambulance', 'Community Paramedicine Ambulance', 'Event Medical Services'],
  };

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


module.exports.createRide =async({user,pickup,destination,vehicletype})=>{
  if(!user||!pickup||!destination||!vehicletype){
    throw new Error('All fields are required')
  }
  const fare =await getFare(pickup,destination);
  const ride =rideModelModel.create({
    user,
    pickup,
    destination,
    otp:getOTP(6),
    fare: fare[vehicletype]
  })
  return ride;
}
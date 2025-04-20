"use client"
import React, { useEffect } from 'react'

const WaitingForDrivers = ({ waitingForDriver, driverDetails, rideStatus, rideOtp }) => {
  useEffect(() => {
    console.log('WaitingForDrivers mounted with driver details:', JSON.stringify(driverDetails));
    console.log('OTP received:', rideOtp);
    
    // Log the specific properties we care about
    if (driverDetails) {
      console.log('Driver name info:', typeof driverDetails.fullname, driverDetails.fullname);
      console.log('Vehicle info:', typeof driverDetails.vehicle, driverDetails.vehicle);
    }
  }, [driverDetails, rideOtp]);

  // Helper function to get display name
  const getDriverName = () => {
    try {
      if (!driverDetails) return 'Driver Name';
      
      // If fullname is a string, use it directly
      if (typeof driverDetails.fullname === 'string') return driverDetails.fullname;
      
      // If fullname is an object with firstname and lastname
      if (driverDetails.fullname?.firstname || driverDetails.fullname?.lastname) {
        const first = driverDetails.fullname.firstname || '';
        const last = driverDetails.fullname.lastname || '';
        return (first + ' ' + last).trim() || 'Driver Name';
      }
      
      // If fullname is just an object
      if (typeof driverDetails.fullname === 'object') {
        const nameStr = JSON.stringify(driverDetails.fullname).replace(/[{}"]/g, '');
        return nameStr || 'Driver Name';
      }
    } catch (e) {
      console.error('Error getting driver name:', e);
    }
    
    return 'Driver Name';
  };

  // Helper function to get vehicle info
  const getVehicleDetails = () => {
    try {
      const defaultVehicle = { plate: 'Vehicle No', type: 'Basic Ambulance' };
      
      if (!driverDetails?.vehicle) return defaultVehicle;
      
      // If vehicle is a string
      if (typeof driverDetails.vehicle === 'string') {
        return { plate: 'Vehicle No', type: driverDetails.vehicle };
      }
      
      // If vehicle is an object
      return {
        plate: driverDetails.vehicle.plate || 'Vehicle No',
        type: driverDetails.vehicle.type || 'Basic Ambulance'
      };
    } catch (e) {
      console.error('Error getting vehicle details:', e);
      return { plate: 'Vehicle No', type: 'Basic Ambulance' };
    }
  };

  const vehicleInfo = getVehicleDetails();
  const driverName = getDriverName();
  
  console.log('WaitingForDrivers rendering with:', {driverName, vehicleInfo, rideOtp});

  return (
    <div>
      <h5 onClick={() => waitingForDriver(false)} className='p-3 text-center w-full absolute top-0'>
        <i className='text-3xl text-gray-200 ri-arrow-down-wide-line'></i>
      </h5>
      <div className='flex items-center justify-between'>
        <img className='h-24' src="images/2Q.png" alt="Driver" />
        <div className='text-right'>
          <h2 className='text-lg font-medium'>{driverName}</h2>
          <h4 className='text-xl font-semibold -mt-1 -mb-1'>{vehicleInfo.plate}</h4>
          <p className='text-sm text-gray-600'>{vehicleInfo.type}</p>
        </div>
      </div>
      
      {rideOtp && (
        <div className='mt-4 text-center bg-gray-100 p-3 rounded-lg border border-gray-300'>
          <p className='text-sm text-gray-600'>Verification Code</p>
          <h3 className='text-2xl font-bold tracking-widest'>{rideOtp}</h3>
          <p className='text-xs text-gray-500'>Share this code with the driver</p>
        </div>
      )}
      
      <div className='mt-4'>
        <p className='text-center text-green-600 font-medium'>
          {rideStatus === 'confirmed' ? 'Driver is on the way!' : 'Waiting for driver...'}
        </p>
      </div>
    </div>
  )
}

export default WaitingForDrivers
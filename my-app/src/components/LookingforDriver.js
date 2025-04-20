import React, { useEffect } from 'react'
import { useSocket } from '@/app/context/SocketContext';

const LookingforDriver = (props) => {
  const { socket, isConnected } = useSocket();
  
  useEffect(() => {
    console.log('LookingforDriver mounted, waiting for driver confirmation');
    
    // Listen for custom ride confirmed event
    const handleRideConfirmed = (event) => {
      console.log('Ride confirmation detected in LookingforDriver:', event);
      
      // Transition to waiting for driver state
      props.setvehicleFound(false);
      props.setconfirmRide(false);
      props.setvehiclepanel(false);
    };
    
    // Direct socket listener for ride-confirmed events
    const handleSocketRideConfirmation = (data) => {
      console.log('🔥 SOCKET: Ride confirmation received directly in LookingforDriver:', data);
      
      // Extract driver data - handle both message formats
      const driverData = data?.driver || (data?.data?.driver) || data;
      console.log('🔥 SOCKET: Extracted driver data:', driverData);
      
      // Format driver details to handle nested objects
      const formattedDriver = {
        _id: driverData?._id || 'unknown',
        fullname: formatDriverName(driverData?.fullname),
        vehicle: formatVehicleInfo(driverData?.vehicle),
        phone: driverData?.phone || 'Unavailable'
      };
      
      console.log('🔥 SOCKET: Formatted driver data for UI:', formattedDriver);
      
      // Force transition to confirmed state
      document.dispatchEvent(new CustomEvent('forceRideUpdate', { 
        detail: { 
          driverDetails: formattedDriver, 
          rideStage: 'confirmed' 
        } 
      }));
    };
    
    // Helper to format driver name from various formats
    const formatDriverName = (fullname) => {
      if (!fullname) return 'Driver';
      
      try {
        // If fullname is a string, use it directly
        if (typeof fullname === 'string') return fullname;
        
        // If fullname is an object with firstname and lastname
        if (fullname.firstname || fullname.lastname) {
          const first = fullname.firstname || '';
          const last = fullname.lastname || '';
          return (first + ' ' + last).trim() || 'Driver';
        }
        
        // If fullname is just an object, convert to string
        if (typeof fullname === 'object') {
          const nameStr = JSON.stringify(fullname).replace(/[{}"]/g, '');
          return nameStr || 'Driver';
        }
      } catch (e) {
        console.error('Error formatting driver name:', e);
      }
      
      // Fallback
      return 'Driver';
    };
    
    // Helper to format vehicle info from various formats
    const formatVehicleInfo = (vehicle) => {
      try {
        // Default value
        const defaultVehicle = { type: 'Ambulance', plate: 'Unknown' };
        
        // If no vehicle data
        if (!vehicle) return defaultVehicle;
        
        // If vehicle is a string
        if (typeof vehicle === 'string') return { type: vehicle, plate: 'Unknown' };
        
        // If vehicle is an object
        if (typeof vehicle === 'object') {
          return {
            type: vehicle.type || 'Ambulance',
            plate: vehicle.plate || 'Unknown'
          };
        }
      } catch (e) {
        console.error('Error formatting vehicle info:', e);
      }
      
      // Fallback
      return { type: 'Ambulance', plate: 'Unknown' };
    };
    
    // Message event listener for ride confirmations
    const handleSocketMessage = (data) => {
      console.log('🔥 SOCKET MESSAGE: Received message event:', data);
      if (data?.event === 'ride-confirmed') {
        console.log('🔥 SOCKET MESSAGE: Ride confirmation in message:', data);
        handleSocketRideConfirmation(data.data);
      }
    };
    
    // DOM event listener for ride confirmations
    const handleDomRideConfirmed = (event) => {
      console.log('🔥 DOM EVENT: Ride confirmation DOM event received:', event.detail);
      handleSocketRideConfirmation(event.detail);
    };
    
    // Add event listeners
    window.addEventListener('rideconfirmed', handleRideConfirmed);
    document.addEventListener('ride-confirmed-dom', handleDomRideConfirmed);
    
    // Add socket listeners if socket is available
    if (socket && isConnected) {
      console.log('🔌 SOCKET: Adding direct socket listeners in LookingforDriver');
      socket.on('ride-confirmed', handleSocketRideConfirmation);
      socket.on('message', handleSocketMessage);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('rideconfirmed', handleRideConfirmed);
      document.removeEventListener('ride-confirmed-dom', handleDomRideConfirmed);
      
      if (socket) {
        socket.off('ride-confirmed', handleSocketRideConfirmation);
        socket.off('message', handleSocketMessage);
      }
    };
  }, [socket, isConnected]);
  
  return (
    <div>
      <h5 onClick={() => {
          props.setvehicleFound(false);
          props.setpanel(false);
          props.setconfirmRide(false);
          props.setvehiclepanel(false)
        }} 
        className='p-3 text-center w-full absolute top-0'>
        <i className='text-3xl text-gray-200 ri-arrow-down-wide-line'></i>
      </h5>
      <div className='flex items-center justify-between'>
        <img className='h-24' src="images/2Q.png" alt="" />
        <div className='text-right'>
          <h2 className='text-lg font-medium'>Ambulance</h2>
          <h4 className='text-xl font-semibold -mt-1 -mb-1'>₹{props.fare.swiftbasic}</h4>
          <p className='text-sm text-gray-600'>{props.pickup}</p>
        </div>
      </div>
      <div className='mt-4 mb-5'>
        <p className='text-center text-gray-600 font-medium'>Looking for Driver...</p>
      </div>
      <div className='flex flex-col gap-5'>
        <div className='flex items-center'>
          <h4 className='text-xl font-semibold'>Pickup: <span className='text-lg text-gray-600 font-medium'>{props.pickup}</span></h4>
        </div>
        <div className='flex items-center'>
          <h4 className='text-xl font-semibold'>Drop: <span className='text-lg text-gray-600 font-medium'>{props.destination}</span></h4>
        </div>
      </div>
    </div>
  )
}

export default LookingforDriver
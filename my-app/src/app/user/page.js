'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserProtectedRoute, { useUser } from '../userProtected/page';
import { logoutUser } from '@/utils/logout';
import { useSocket } from '../context/SocketContext';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import LocationSearchPanel from '@/components/locationSearchpanel';
import Vehicelpanel from '@/components/vehicelpanel';
import ConfirmRide from '@/components/ConfirmRide';
import LookingforDriver from '@/components/LookingforDriver';
import WaitingForDrivers from '@/components/WaitingForDrivers';

const UserContent = () => {
  const router = useRouter();
  const { user } = useUser();
  const { sendMessage, receivemessage, isConnected, socket } = useSocket();

  const [pickup, setpickup] = useState('');
  const [dropoff, setdropoff] = useState('');
  const [vehicleType, setvehicleType] = useState(null);
  const [rideStage, setRideStage] = useState('idle'); // stages: idle, vehicle-select, confirm, searching, confirmed
  const [fare, setfare] = useState({});
  const [driverDetails, setDriverDetails] = useState(null);
  const [rideStatus, setRideStatus] = useState('waiting');
  const [rideOtp, setRideOtp] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [showDefaultLocations, setShowDefaultLocations] = useState(true);

  const panelRef = useRef(null);
  const vehiclepanelRef = useRef(null);
  const confirmRideRef = useRef(null);
  const vehiclefoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const panelcloseRef = useRef(null);
  const userMounted = useRef(false);

  // Mounting
  useEffect(() => {
    userMounted.current = true;
    return () => { userMounted.current = false; };
  }, []);

  // Direct handler for ride confirmation that doesn't rely on socket events
  useEffect(() => {
    // Create a function to handle direct ride confirmation
    const handleDirectRideConfirmation = (event) => {
      if (event && event.data && event.data.detail === 'ride-confirmed') {
        console.log('🛎️ DIRECT: Custom event received:', event.data);
        processRideConfirmation(event.data.payload);
      }
    };
    
    // Add event listener for direct messaging
    window.addEventListener('rideconfirmed', handleDirectRideConfirmation);
    
    return () => {
      window.removeEventListener('rideconfirmed', handleDirectRideConfirmation);
    };
  }, []);

  // Process ride confirmation data from any source
  const processRideConfirmation = (data) => {
    console.log('🚗 RIDE CONFIRMATION: Processing data:', data);
    
    try {
      // Extract driver data
      const driverData = data?.driver || (data?.data?.driver) || {};
      console.log('🚗 RIDE CONFIRMATION: Driver data extracted:', driverData);
      
      // Extract OTP if available
      const otp = data?.otp || data?.data?.otp || null;
      console.log('🚗 RIDE CONFIRMATION: OTP extracted:', otp);
      
      // Format driver details safely
      const formattedDriverData = {
        _id: driverData._id || 'unknown',
        fullname: formatDriverName(driverData.fullname),
        vehicle: formatVehicleInfo(driverData.vehicle),
        phone: driverData.phone || 'Unavailable'
      };
      
      console.log('🚗 RIDE CONFIRMATION: Driver formatted:', formattedDriverData);
      
      // Update state
      setDriverDetails(formattedDriverData);
      setRideStatus('confirmed');
      if (otp) setRideOtp(otp);
      
      // Force stage change
      console.log('🚗 RIDE CONFIRMATION: Changing stage from', rideStage, 'to confirmed');
      setRideStage('confirmed');
      
      // Force UI update to show waiting panel
      setTimeout(() => {
        if (waitingForDriverRef.current) {
          console.log('🚗 RIDE CONFIRMATION: Forcing panel visibility');
          gsap.to(waitingForDriverRef.current, {
            transform: 'translate(0)',
            duration: 0.3
          });
        }
      }, 300);
    } catch (error) {
      console.error('Error processing ride confirmation:', error);
    }
  };

  // Helper function to format driver name
  const formatDriverName = (fullname) => {
    if (!fullname) return 'Driver';
    if (typeof fullname === 'string') return fullname;
    if (fullname.firstname && fullname.lastname) {
      return `${fullname.firstname} ${fullname.lastname}`;
    }
    return JSON.stringify(fullname).replace(/[{}"]/g, '');
  };
  
  // Helper function to format vehicle info
  const formatVehicleInfo = (vehicle) => {
    if (!vehicle) return { type: 'Ambulance', plate: 'Unknown' };
    if (typeof vehicle === 'string') return { type: vehicle, plate: 'Unknown' };
    return {
      type: vehicle.type || 'Ambulance',
      plate: vehicle.plate || 'Unknown'
    };
  };

  // Direct socket listener for ride confirmations
  useEffect(() => {
    if (!user?._id || !isConnected || !socket) return;
    
    console.log('🎯 DIRECT: Setting up direct socket listener for ride-confirmed');
    
    // Direct socket listener for ride-confirmed events
    socket.on('ride-confirmed', (ride) => {
      console.log('🎯 DIRECT: Received ride-confirmed directly from socket:', ride);
      
      // Extract driver data
      const driverData = ride?.driver || {};
      
      // Extract OTP if available
      const otp = ride?.otp || null;
      console.log('🎯 DIRECT: OTP received:', otp);
      
      // Format driver data
      const formattedDriver = {
        _id: driverData._id || 'unknown',
        fullname: typeof driverData.fullname === 'string' 
          ? driverData.fullname 
          : (driverData.fullname?.firstname || '') + ' ' + (driverData.fullname?.lastname || ''),
        vehicle: driverData.vehicle || { type: 'Ambulance', plate: 'Unknown' },
        phone: driverData.phone || 'Unavailable'
      };
      
      console.log('🎯 DIRECT: Formatted driver data:', formattedDriver);
      
      // Update state directly
      setDriverDetails(formattedDriver);
      setRideStatus('confirmed');
      if (otp) setRideOtp(otp);
      setRideStage('confirmed');
      
      console.log('🎯 DIRECT: State updated to confirmed');
      
      // Force UI update
      setTimeout(() => {
        if (waitingForDriverRef.current) {
          console.log('🎯 DIRECT: Forcing panel visibility');
          gsap.to(waitingForDriverRef.current, {
            transform: 'translate(0)',
            duration: 0.3
          });
        }
      }, 300);
    });
    
    // Handle message events that contain ride confirmations
    socket.on('message', (data) => {
      if (data?.event === 'ride-confirmed') {
        console.log('🎯 DIRECT: Detected ride-confirmed in message event:', data);
        
        // Extract ride data
        const ride = data.data;
        
        // Process as if it came directly
        socket.emit('ride-confirmed', ride);
      }
    });
    
    return () => {
      socket.off('ride-confirmed');
      socket.off('message');
    };
  }, [user, isConnected, socket]);

  // GSAP Animations
  useGSAP(() => {
    gsap.to(panelRef.current, {
      height: rideStage === 'idle' ? '70%' : '0%',
      padding: rideStage === 'idle' ? 24 : 0
    });
  }, [rideStage]);

  useGSAP(() => {
    gsap.to(panelcloseRef.current, { opacity: rideStage === 'idle' ? 1 : 0 });
  }, [rideStage]);

  useGSAP(() => {
    gsap.to(vehiclepanelRef.current, {
      transform: rideStage === 'vehicle-select' ? 'translate(0)' : 'translateY(100%)'
    });
  }, [rideStage]);

  useGSAP(() => {
    gsap.to(confirmRideRef.current, {
      transform: rideStage === 'confirm' ? 'translate(0)' : 'translateY(100%)'
    });
  }, [rideStage]);

  useGSAP(() => {
    gsap.to(vehiclefoundRef.current, {
      transform: rideStage === 'searching' ? 'translate(0)' : 'translateY(100%)'
    });
  }, [rideStage]);

  useGSAP(() => {
    gsap.to(waitingForDriverRef.current, {
      transform: rideStage === 'confirmed' ? 'translate(0)' : 'translateY(100%)'
    });
  }, [rideStage]);

  const fetchSuggestions = async (input, type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/maps/get-suggestions?input=${encodeURIComponent(input)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setSuggestions(data.predictions || data || []);
    } catch {
      setSuggestions([]);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;
    setRideStage('vehicle-select');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/get-fare?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      const fareData = await response.json();
      setfare(fareData);
    } catch {
      alert('Fare fetch failed');
    }
  };

  const createRide = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pickup, destination: dropoff, vehicleType })
      });

      setRideStage('searching');
    } catch {
      alert('Create ride failed');
      setRideStage('vehicle-select');
    }
  };

  const handleInputChange = async (e, type) => {
    const value = e.target.value;
    if (type === 'pickup') setpickup(value);
    else setdropoff(value);

    setActiveInput(type);
    setRideStage('idle');

    if (value.length >= 3) {
      await fetchSuggestions(value, type);
      setShowDefaultLocations(false);
    } else {
      setSuggestions([]);
      setShowDefaultLocations(true);
    }
  };

  const handleLocationSelect = (location) => {
    if (activeInput === 'pickup') setpickup(location);
    else setdropoff(location);
    setSuggestions([]);
    setShowDefaultLocations(true);
  };

  const handleLogout = async () => {
    await logoutUser('users/logout');
    localStorage.removeItem('token');
    router.push('/login/loginuser');
  };

  // Polling mechanism to force UI update if stuck in searching
  useEffect(() => {
    // Only run if we're in 'searching' state
    if (rideStage !== 'searching') return;
    
    // Check every 2 seconds if we need to transition
    const interval = setInterval(() => {
      // If we have driver details but still in searching state, force transition
      if (driverDetails && rideStage === 'searching') {
        console.log('🚨 EMERGENCY: Found driver details but still in searching state, forcing transition');
        setRideStage('confirmed');
        
        // Force panel visibility
        if (waitingForDriverRef.current) {
          gsap.to(waitingForDriverRef.current, {
            transform: 'translate(0)',
            duration: 0.3
          });
        }
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [driverDetails, rideStage]);

  // Add a global event handler for ride confirmations
  useEffect(() => {
    console.log('Setting up global ride confirmation handler');
    
    // Global handler that runs outside React's lifecycle
    window.handleGlobalRideConfirmation = (data) => {
      console.log('🚨 GLOBAL: Ride confirmation received:', data);
      
      try {
        // Parse data if it's a string
        const eventData = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Extract driver data
        const driverInfo = eventData?.data?.driver || eventData?.driver || {};
        console.log('🚨 GLOBAL: Driver data:', driverInfo);
        
        // Extract OTP
        const otp = eventData?.data?.otp || eventData?.otp || null;
        console.log('🚨 GLOBAL: OTP received:', otp);
        
        // Format driver data
        const driverDetails = {
          _id: driverInfo._id || 'unknown',
          fullname: typeof driverInfo.fullname === 'string' 
            ? driverInfo.fullname 
            : (driverInfo.fullname?.firstname || '') + ' ' + (driverInfo.fullname?.lastname || ''),
          vehicle: driverInfo.vehicle || { type: 'Ambulance', plate: 'Unknown' },
          phone: driverInfo.phone || 'Unavailable'
        };
        
        // Force state updates
        console.log('🚨 GLOBAL: Setting driver details and changing state to confirmed');
        window.globalDriverDetails = driverDetails;
        window.globalRideStatus = 'confirmed';
        window.globalRideOtp = otp;
        
        // Direct DOM update as fallback
        document.dispatchEvent(new CustomEvent('forceRideUpdate', { 
          detail: { driverDetails, rideStage: 'confirmed', rideOtp: otp } 
        }));
        
        // Try to update React state directly
        try {
          window.setDriverDetailsGlobal(driverDetails);
          window.setRideStageGlobal('confirmed');
          if (otp) window.setRideOtpGlobal(otp);
        } catch (e) {
          console.error('Error updating state globally:', e);
        }
      } catch (error) {
        console.error('Error in global ride confirmation handler:', error);
      }
    };
    
    // Listen for the ride-confirmed socket event
    const messageHandler = (event) => {
      if (event.data && typeof event.data === 'object') {
        if (event.data.event === 'ride-confirmed') {
          window.handleGlobalRideConfirmation(event.data);
        }
      }
    };
    
    // Listen for the force update event
    const forceUpdateHandler = (event) => {
      console.log('🚨 FORCE: Update event received:', event.detail);
      if (event.detail && event.detail.driverDetails) {
        setDriverDetails(event.detail.driverDetails);
        setRideStatus('confirmed');
        setRideStage('confirmed');
        
        // Force UI update
        setTimeout(() => {
          if (waitingForDriverRef.current) {
            gsap.to(waitingForDriverRef.current, {
              transform: 'translate(0)',
              duration: 0.3
            });
          }
        }, 300);
      }
    };
    
    // Expose state setters globally
    window.setDriverDetailsGlobal = setDriverDetails;
    window.setRideStageGlobal = setRideStage;
    window.setRideOtpGlobal = setRideOtp;
    
    // Register event listeners
    window.addEventListener('message', messageHandler);
    document.addEventListener('forceRideUpdate', forceUpdateHandler);
    
    return () => {
      window.removeEventListener('message', messageHandler);
      document.removeEventListener('forceRideUpdate', forceUpdateHandler);
      delete window.handleGlobalRideConfirmation;
      delete window.setDriverDetailsGlobal;
      delete window.setRideStageGlobal;
      delete window.setRideOtpGlobal;
      delete window.globalDriverDetails;
      delete window.globalRideStatus;
      delete window.globalRideOtp;
    };
  }, []);

  // Polling mechanism to check for global state updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.globalDriverDetails && (!driverDetails || driverDetails._id !== window.globalDriverDetails._id)) {
        console.log('🚨 POLL: Detected global driver details, updating state');
        setDriverDetails(window.globalDriverDetails);
        
        if (window.globalRideStatus && rideStatus !== window.globalRideStatus) {
          setRideStatus(window.globalRideStatus);
        }
        
        if (rideStage !== 'confirmed') {
          setRideStage('confirmed');
        }
        
        // Force panel visibility
        setTimeout(() => {
          if (waitingForDriverRef.current) {
            gsap.to(waitingForDriverRef.current, {
              transform: 'translate(0)',
              duration: 0.3
            });
          }
        }, 300);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [driverDetails, rideStage, rideStatus]);

  // Join socket room when connected
  useEffect(() => {
    if (!user?._id || !isConnected || !socket) return;
    
    console.log('🔌 CONNECT: Joining socket room as user:', user._id);
    
    // Join as user
    sendMessage('join', { 
      userType: 'user', 
      userId: user._id 
    });
    
    // Also join directly via socket
    socket.emit('join', { 
      userType: 'user', 
      userId: user._id 
    });
    
  }, [user, isConnected, socket, sendMessage]);

  return (
    <>
      <div className='h-screen relative'>
        <button onClick={handleLogout} className="px-6 py-3 top-0 absolute right-0 z-10 bg-red-600 text-white rounded hover:bg-red-500 transition">Logout</button>
        <img className='w-20 absolute left-5 top-5' src="images/logo11.png" alt="Logo" />
        <div className='h-screen w-screen'>
          <img className='h-full w-full object-cover' src="https://www.medianama.com/wp-content/uploads/2018/06/Screenshot_20180619-112715.png.png" alt="Map" />
        </div>
        <div className='absolute top-0 w-full flex flex-col justify-end h-screen'>
          <div className='h-[35%] bg-white p-5 relative'>
            <h4 onClick={() => setRideStage('idle')} className='text-2xl font-bold cursor-pointer'>
              Find Your Nearest Ambulance <i ref={panelcloseRef} className="ri-arrow-down-s-line ml-2"></i>
            </h4>
            <form onSubmit={submitHandler} className='flex flex-col'>
              <input value={pickup} onChange={(e) => handleInputChange(e, 'pickup')} type="text" placeholder='Add Pickup Location' className='bg-[#eee] px-12 py-2 rounded-lg w-full mt-5' />
              <input value={dropoff} onChange={(e) => handleInputChange(e, 'dropoff')} type="text" placeholder='Add Drop Location (Hospital)' className='bg-[#eee] px-12 py-2 rounded-lg w-full mt-5' />
              <button type="submit" className='bg-green-500 text-white font-semibold rounded-lg px-10 p-3 mt-5 w-full'>Find Trip</button>
            </form>
          </div>
          <div ref={panelRef} className='bg-white h-[0%] overflow-hidden'>
            <LocationSearchPanel
              suggestions={suggestions}
              setpanel={() => setRideStage('idle')}
              setvehiclepanel={() => setRideStage('vehicle-select')}
              onLocationSelect={handleLocationSelect}
              isPickup={activeInput === 'pickup'}
              pickup={pickup}
              dropoff={dropoff}
              showDefaultLocations={showDefaultLocations}
            />
          </div>
        </div>

        <div ref={vehiclepanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 translate-y-full'>
          {rideStage === 'vehicle-select' && (
            <Vehicelpanel
              setpanel={() => setRideStage('idle')}
              setconfirmRide={() => setRideStage('confirm')}
              setvehiclepanel={() => setRideStage('idle')}
              fare={fare}
              setvehicleType={setvehicleType}
            />
          )}
        </div>

        <div ref={confirmRideRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 translate-y-full'>
          {rideStage === 'confirm' && (
            <ConfirmRide
              fare={fare}
              pickup={pickup}
              destination={dropoff}
              setvehicleType={setvehicleType}
              setvehicleFound={() => setRideStage('searching')}
              setpanel={() => setRideStage('idle')}
              setconfirmRide={() => setRideStage('vehicle-select')}
              setvehiclepanel={() => setRideStage('vehicle-select')}
              createRide={createRide}
            />
          )}
        </div>

        <div ref={vehiclefoundRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 translate-y-full'>
          {rideStage === 'searching' && (
            <LookingforDriver
              setpanel={() => setRideStage('idle')}
              setvehiclepanel={() => setRideStage('vehicle-select')}
              setconfirmRide={() => setRideStage('confirm')}
              setvehicleFound={() => setRideStage('searching')}
              createRide={createRide}
              fare={fare}
              pickup={pickup}
              destination={dropoff}
            />
          )}
        </div>

        <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 translate-y-full'>
          <div style={{ 
            opacity: rideStage === 'confirmed' ? 1 : 0,
            visibility: rideStage === 'confirmed' ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease'
          }}>
            {console.log("🚗 RENDER: WaitingForDrivers panel", {
              rideStage,
              driverDetails: driverDetails ? 'present' : 'missing',
              opacity: rideStage === 'confirmed' ? 1 : 0
            })}
            
            {driverDetails ? (
              <WaitingForDrivers
                waitingForDriver={() => setRideStage('idle')}
                driverDetails={driverDetails}
                rideStatus={rideStatus}
                rideOtp={rideOtp}
              />
            ) : (
              <div className="text-center py-4">
                <p className="text-red-500">Connecting to driver...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const User = () => (
  <UserProtectedRoute>
    <UserContent />
  </UserProtectedRoute>
);

export default User;

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CaptainProtectedRoute from '../captainprotected/page'; // Ensure this path is accurate
import { logoutUser } from '@/utils/logout';
import Link from 'next/link';
import 'remixicon/fonts/remixicon.css'
import CaptainDetail from '@/components/CaptainDeatil';
import Ridenotification from '@/components/Ridenotification';
import { useDriver } from '../context/captaincontext';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ConfirmRidenotification from '@/components/ConfirmRidenotification';
import { useSocket } from '../context/SocketContext';
import LiveTracking from '@/components/LiveTracking';

const DriverPage = () => {
  const router = useRouter();
  const { driverData, isLoading } = useDriver();
  const [ridenotifypopup, setridenotifypopup] = useState(false);
  const [ConfirmRidenotify, setConfirmridenotify] = useState(false);
  const [ride, setRide] = useState(null);
  const ridenotifyRef = useRef(null);
  const confirmridenotifyRef = useRef(null);
  const { sendMessage, receivemessage, isConnected } = useSocket();

  useEffect(() => {
    if (driverData?._id && isConnected) {
      console.log('Attempting to join with user:', driverData._id);
      sendMessage("join", { 
        userType: "ambulancedriver", 
        userId: driverData._id 
      });
    }

    // Handle new ride notifications
    const handleNewRide = (data) => {
      console.log('New ride notification received:', data);
      if (data.event === 'new-ride') {
        setRide(data.data);
        setridenotifypopup(true);
      }
    };

    // Listen for messages (which include ride notifications)
    receivemessage('message', handleNewRide);

    const updateLocation = () => {
      if (navigator.geolocation && driverData?._id) {
        navigator.geolocation.getCurrentPosition(position => {
          sendMessage('update-location-driver', {
            userId: driverData._id,
            userType: "ambulancedriver",
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        });
      }
    };

    const intervalId = setInterval(updateLocation, 10000);
    updateLocation();

    return () => {
      clearInterval(intervalId);
    };
  }, [driverData, isConnected, sendMessage, receivemessage]);

  const confirmRide = async () => {
    try {
      console.log('Confirming ride:', ride._id);
      
      // First update UI to prevent multiple clicks
      setridenotifypopup(false);
      setConfirmridenotify(true);
      
      // Format driver data for consistency
      const driverInfo = {
        _id: driverData._id,
        fullname: driverData.fullname || { firstname: "Driver", lastname: "" },
        vehicle: driverData.vehicle || { type: "Ambulance", plate: "Unknown" },
        // Make phone optional
        ...(driverData.phonenumber && { phone: driverData.phonenumber }),
        ...(driverData.phone && { phone: driverData.phone })
      };
      
      console.log('🚨 DRIVER INFO BEING SENT:', JSON.stringify(driverInfo));
      
      // 1. Direct socket event for ride confirmation
      sendMessage('ride-confirmed', {
        driver: driverInfo,
        rideId: ride._id
      });
      
      // 2. Socket message event for broader compatibility
      sendMessage('message', {
        event: 'ride-confirmed',
        data: {
          driver: driverInfo,
          rideId: ride._id
        }
      });
      
      // 3. Direct socket emit for immediate delivery
      if (isConnected) {
        const socket = window.socket;
        if (socket) {
          console.log('🔥 DIRECT SOCKET: Emitting ride-confirmed directly');
          socket.emit('ride-confirmed', {
            driver: driverInfo,
            rideId: ride._id
          });
        }
      }
      
      // Call the API to update the database
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rideId: ride._id,
          driverId: driverData._id,
          driverInfo: driverInfo  // Include complete driver info in API call
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm ride');
      }

      const confirmedRide = await response.json();
      console.log('🎉 Ride confirmed successfully:', confirmedRide);
      
      // Try a last broadcast attempt after confirmation
      setTimeout(() => {
        console.log('🔄 RETRY: Sending final confirmation broadcast');
        sendMessage('ride-confirmed', {
          driver: driverInfo,
          rideId: ride._id,
          confirmed: true
        });
      }, 500);
      
      // Navigate to riding page after a short delay
     
    } catch (error) {
      console.error('Error confirming ride:', error);
      alert('Failed to confirm ride: ' + error.message);
    }
  };

  useGSAP(function(){
    if(ridenotifypopup){
      gsap.to(ridenotifyRef.current,{
        transform:"translate(0)",
      });
    } else {
      gsap.to(ridenotifyRef.current,{
        transform:"translateY(100%)"
      });
    }
  },[ridenotifypopup]);

  useGSAP(function(){
    if(ConfirmRidenotify){
      gsap.to(confirmridenotifyRef.current,{
        transform:"translate(0)",
      });
    } else {
      gsap.to(confirmridenotifyRef.current,{
        transform:"translateY(100%)"
      });
    }
  },[ConfirmRidenotify]);

  const handleLogout = async () => {
    try {
      await logoutUser('ambulancedriver/logout');
      router.push('/login/driverlogin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className='h-screen'>
      <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
        <img className='w-25' src="images/logo11.png" alt=''/>
        <Link onClick={handleLogout} href="/login/driverlogin" className='h-10 w-10 bg-white flex item-center justify-center rounded-full'>
          <i className="text-3xl font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>
      <div className='h-3/5'>
        <LiveTracking/>
      </div>
      <div className='h-2/5 p-6'>
        <CaptainDetail driver={driverData}/>
      </div>
      <div ref={ridenotifyRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6'>
        <Ridenotification 
          setridenotifypopup={setridenotifypopup} 
          setConfirmridenotify={setConfirmridenotify}
          ride={ride}
          confirmRide={confirmRide}
        />
      </div>
      <div ref={confirmridenotifyRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 translate-y-full h-screen'>
        <ConfirmRidenotification 
          setConfirmridenotify={setConfirmridenotify}
          ride={ride}
          setRideData={(rideData) => {
            // Store ride data in localStorage
            try {
              // Store ride data
              localStorage.setItem('currentRide', JSON.stringify({
                _id: ride._id,
                pickup: ride.pickup,
                destination: ride.destination,
                fare: ride.fare,
                status: 'ongoing'
              }));
              
              // Store passenger details
              if (ride.user) {
                localStorage.setItem('passengerDetails', JSON.stringify(ride.user));
              }
              
              console.log('Stored ride data for driver');
            } catch (error) {
              console.error('Error storing ride data:', error);
            }
          }}
        />
      </div>
    </div>
  );
};

// Properly returns JSX
const DriverDashboardPage = () => {
  return (
    <CaptainProtectedRoute>
      <DriverPage />
    </CaptainProtectedRoute>
  );
};

export default DriverDashboardPage;

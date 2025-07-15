"use client"
import React, { useRef, useState, useEffect } from 'react'
import CaptainProtectedRoute from '../captainprotected/page'
import { logoutUser } from '@/utils/logout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import FinishRide from '@/components/FinishRide';
import { useDriver } from '../context/captaincontext';
import { useSocket } from '../context/SocketContext';
import GoogleMapsProvider from '@/components/GoogleMapsProvider';
import DriverLiveRouteMap from '@/components/DriverLiveRouteMap';

const DriverRidingPage = () => {
  const [finishRidepnael, setfinishRidepnael] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const finishRidepnaelRef = useRef(null);
  const router = useRouter();
  const { driverData } = useDriver();
  const { socket, isConnected, sendMessage, receivemessage } = useSocket();
  
  // Load ride data from localStorage
  useEffect(() => {
    try {
      const storedRide = localStorage.getItem('currentRide');
      const storedPassenger = localStorage.getItem('passengerDetails');
      
      if (storedRide) {
        setCurrentRide(JSON.parse(storedRide));
      }
      
      if (storedPassenger) {
        setPassengerDetails(JSON.parse(storedPassenger));
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading ride data:', error);
      setIsLoading(false);
    }
  }, []);

  // Listen for ride-ended events
  useEffect(() => {
    if (!isConnected || !socket) return;

    const handleRideEnded = (data) => {
      console.log('Ride ended event received:', data);
      
      // Clear ride data
      localStorage.removeItem('currentRide');
      localStorage.removeItem('passengerDetails');
      
      // Navigate to driver homepage
      router.push('/driver');
    };

    // Listen for ride-ended events
    receivemessage('ride-ended', handleRideEnded);
    
    // Also listen via message event for redundancy
    const handleMessage = (data) => {
      if (data.event === 'ride-ended') {
        handleRideEnded(data.data);
      }
    };
    
    receivemessage('message', handleMessage);
    
    return () => {
      // Clean up
      if (socket) {
        socket.off('ride-ended');
        socket.off('message');
      }
    };
  }, [isConnected, socket, router, receivemessage]);

  useGSAP(function(){
    if(finishRidepnael){
      gsap.to(finishRidepnaelRef.current,{
        transform:"translate(0)",
      });
    } else {
      gsap.to(finishRidepnaelRef.current,{
        transform:"translateY(100%)"
      });
    }
  },[finishRidepnael]);

  const handleLogout = async () => {
    try {
      await logoutUser('ambulancedriver/logout');
      router.push('/login/driverlogin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const finishRide = () => {
    setfinishRidepnael(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-medium">Loading ride data...</p>
      </div>
    );
  }

  // Combine ride data with passenger details for the FinishRide component
  const combinedRideData = currentRide ? {
    ...currentRide,
    user: passengerDetails
  } : null;

  return (
    <div className='h-screen relative'>
      <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
        <img className='w-25' src="/images/logo11.png" alt=''/>
        <Link href="/driver">
          <div className='h-10 w-10 bg-white flex items-center justify-center rounded-full cursor-pointer'>
            <i className="text-3xl font-medium ri-logout-box-r-line"></i>
          </div>
        </Link>
      </div>
      
      <div className='h-4/5'>
        <GoogleMapsProvider>
          {currentRide && (
            <DriverLiveRouteMap
              pickup={currentRide.pickup}
              destination={currentRide.destination}
            />
          )}
        </GoogleMapsProvider>
      </div>
      
      <div className='h-1/5 p-6 bg-red-200 flex flex-col items-center justify-center relative'>
        <h5 className='p-3 text-center w-full absolute top-0'> 
          <i className='text-3xl text-black-200 ri-arrow-down-wide-line'></i>
        </h5>
        
        {currentRide && (
          <div className='w-full text-center mb-3'>
            <p className='text-lg font-medium'>
              {currentRide.pickup} → {currentRide.destination}
            </p>
          </div>
        )}
        
        <div className='flex items-center justify-between w-full'>
          <h4 className='text-2xl font-semibold'>
            {currentRide ? `₹${currentRide.fare}` : '4 KM away'}
          </h4>
          <button 
            onClick={finishRide} 
            className='bg-green-500 text-white font-semibold rounded-lg px-10 p-3'
          >
            Complete Ride
          </button>
        </div>
      </div>

      <div ref={finishRidepnaelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 translate-y-full h-screen'>
        <FinishRide 
          setfinishRidepnael={setfinishRidepnael}
          rideData={combinedRideData}
        />
      </div>
    </div>
  )
}

const DriverRiding = () => {
  return (
    <CaptainProtectedRoute>
      <DriverRidingPage />
    </CaptainProtectedRoute>
  );
};
  
export default DriverRiding
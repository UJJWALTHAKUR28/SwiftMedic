'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserProtectedRoute, { useUser } from '../userProtected/page';
import { logoutUser } from '@/utils/logout';
import driversignup from '../login/driversignup/page';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import LocationSearchPanel from '@/components/locationSearchpanel';
import Vehicelpanel from '@/components/vehicelpanel';
import ConfirmRide from '@/components/ConfirmRide';
import LookingforDriver from '@/components/LookingforDriver';
import WaitingForDrivers from '@/components/WaitingForDrivers';
import { useSocket } from '../context/SocketContext';
ConfirmRide
const UserContent = () => {
  const router = useRouter();
  const { user } = useUser();
  const [pickup, setpickup] = useState('')
  const [dropoff, setdropoff] = useState('')
  const [panel, setpanel] = useState(false)
  const panelRef= useRef(null)
  const vehiclepanelRef= useRef(null)
  const confirmRideRef= useRef(null)
  const panelcloseRef= useRef(null)
  const vehiclefoundRef= useRef(null)
  const waitingForDriverRef= useRef(null)
  const { sendMessage, receivemessage, isConnected } = useSocket();
  
  useEffect(() => {
    if (user?._id && isConnected) {
      console.log('Attempting to join with user:', user._id);
      sendMessage("join", { 
        userType: "user", 
        userId: user._id 
      });
    }
  }, [user, isConnected, sendMessage]);
  
  const [vehicleType, setvehicleType] = useState(null)
  const [vehiclepanel, setvehiclepanel] = useState(false)
  const [confirmRide, setconfirmRide] = useState(false)
  const [vehicleFound, setvehicleFound] = useState(false)
  const [waitingForDriver, setwaitingForDriver] = useState(false)
  const [fare, setfare] = useState({})
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // 'pickup' or 'dropoff'
  const [showDefaultLocations, setShowDefaultLocations] = useState(true); // New state to control default locations visibility

  const fetchSuggestions = async (input, type) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/maps/get-suggestions?input=${encodeURIComponent(input)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch suggestions');
      }

      const data = await response.json();
      if (data && Array.isArray(data)) {
        setSuggestions(data);
      } else if (data && data.predictions) {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
};

const submitHandler = async (e) => {
  e.preventDefault();

  // Only proceed if both pickup and dropoff are set
  if (pickup && dropoff) {
    const data = {
      pickup: pickup,
      dropoff: dropoff
    };
    console.log(data);
    setpanel(false); // Close the suggestions panel
    setvehiclepanel(true); // Show vehicle panel when Find Trip button is clicked

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
       
      // Fix: Correct API URL construction
      const fareURL = `${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/get-fare?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}`;
      
      console.log('Requesting fare from:', fareURL); // Debug log

      const response = await fetch(fareURL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch fare details');
      }

      const fareData = await response.json();
      console.log('Fare data received:', fareData); // Debug log
      setfare(fareData);
    } catch (error) {
      console.error('Error fetching fare details:', error);
      // Optionally show user-friendly error message
      alert('Unable to calculate fare. Please try again.');
    }
  }
};
  
  useGSAP(function(e){
    if(panel){
      gsap.to(panelRef.current,{
        height:'70%',
        padding:24
      })
    } else {
      gsap.to(panelRef.current,{
        height:'0%',
        padding:0
      })
    }
  },[panel])

  useGSAP(function(e){
    if(panel){
      gsap.to(panelcloseRef.current,{
        opacity:1
      })
    } else {
      gsap.to(panelcloseRef.current,{
        opacity:0
      })
    }
  },[panel])
  
  useGSAP(function(){
    if(vehiclepanel){
      gsap.to(vehiclepanelRef.current,{
        transform:"translate(0)",
      })
    } else {
      gsap.to(vehiclepanelRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[vehiclepanel])

  useGSAP(function(){
    if(confirmRide){
      gsap.to(confirmRideRef.current,{
        transform:"translate(0)",
      })
    } else {
      gsap.to(confirmRideRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[confirmRide])
  
  useGSAP(function(){
    if(vehicleFound){
      gsap.to(vehiclefoundRef.current,{
        transform:"translate(0)",
      })
    } else {
      gsap.to(vehiclefoundRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[vehicleFound])

  useGSAP(function(){
    if(waitingForDriver){
      gsap.to(waitingForDriverRef.current,{
        transform:"translate(0)",
      })
    } else {
      gsap.to(waitingForDriverRef.current,{
        transform:"translateY(100%)"
      })
    }
  },[waitingForDriver])

  const handleInputChange = async (e, type) => {
    const value = e.target.value;
    
    if (type === 'pickup') {
      setpickup(value);
      setActiveInput('pickup');
    } else {
      setdropoff(value);
      setActiveInput('dropoff');
    }

    // Always show panel when typing
    setpanel(true);
    
    if (value.length >= 3) {
      await fetchSuggestions(value, type);
      setShowDefaultLocations(false);
    } else {
      setSuggestions([]);
      setShowDefaultLocations(true);
    }
  };

  const handleLocationSelect = (location) => {
    if (activeInput === 'pickup') {
      setpickup(location);
    } else {
      setdropoff(location);
    }
    
    // Do NOT close the panel after selection - keep it open
    setSuggestions([]);
    setShowDefaultLocations(true);
  };

  const handlePanelToggle = () => {
    setpanel(!panel);
  };

  const createRide = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      // Ensure all required data is present
      if (!pickup || !dropoff || !vehicleType) {
        throw new Error('Missing required ride details');
      }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pickup,
          destination: dropoff,
          vehicleType
        })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create ride');
      }
  
      const data = await response.json();
      setvehicleFound(true);
      setconfirmRide(false);
      return data;
  
    } catch (error) {
      console.error('Create ride error:', error);
      alert('Failed to create ride: ' + error.message);
      setvehicleFound(false);
    }
  };
  const handleLogout = async () => {
    try {
      await logoutUser('users/logout');
      localStorage.removeItem('token');
      router.push('/login/loginuser');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  return (
    <>
      <div className='h-screen relative'>
        <button
          onClick={handleLogout}
          className="px-6 py-3 
          top-0 absolute right-0 z-10
          bg-red-600 text-white rounded hover:bg-red-500 transition"
        >
          Logout
        </button>
        <img className='w-20 absolute left-5 top-5' src="images/logo11.png" alt="Logo" />
        <div className='h-screen w-screen'>
          <img className='h-full w-full object-cover' src="https://www.medianama.com/wp-content/uploads/2018/06/Screenshot_20180619-112715.png.png" alt="Map" />
        </div>
        <div className='absolute top-0 w-full flex flex-col justify-end h-screen'>
          <div className='h-[35%] bg-white p-5 relative'>
            <h4 onClick={handlePanelToggle} className='text-2xl black font-bold cursor-pointer'>
              Find Your Nearest Ambulance 
              <i ref={panelcloseRef} className="ri-arrow-down-s-line ml-2"></i>
            </h4>
            
            <form onSubmit={submitHandler} className='flex flex-col'>
              <div className='circle absolute h-4 w-4 rounded-full left-10.5 top-[34%] border-4 border-gray-900 bg-white'></div>
              <div className='circle absolute h-3 w-3 rounded-full left-11 top-[60%] border-3 border-gray-900 bg-white'></div>
              <div className='line absolute h-16 w-1 left-12 top-[37%] bg-gray-900'></div>
              <input 
                value={pickup} 
                onChange={(e) => handleInputChange(e, 'pickup')}
                onClick={() => {
                  setpanel(true);
                  setActiveInput('pickup');
                }}
                type="text"
                placeholder='Add Pickup Location'
                className='bg-[#eee] px-12 py-2 rounded-lg w-full mt-5'
              />
              <input 
                value={dropoff} 
                onChange={(e) => handleInputChange(e, 'dropoff')}
                onClick={() => {
                  setpanel(true);
                  setActiveInput('dropoff');
                }}
                type="text"
                placeholder='Add Drop Location (Hospital)'
                className='bg-[#eee] px-12 py-2 rounded-lg w-full mt-5'
              />
              <button 
                type="submit" 
                className='bg-green-500 text-white font-semibold rounded-lg px-10 p-3 mt-5 w-full'
              >
                Find Trip
              </button>
            </form>
          </div>
          <div ref={panelRef} className='bg-white h-[0%] overflow-hidden'>
            <LocationSearchPanel 
              suggestions={suggestions}
              setpanel={setpanel}
              setvehiclepanel={setvehiclepanel}
              onLocationSelect={handleLocationSelect}
              isPickup={activeInput === 'pickup'}
              pickup={pickup}
              dropoff={dropoff}
              showDefaultLocations={showDefaultLocations}
            />
          </div>
        </div>
        <div ref={vehiclepanelRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 translate-y-full'>
          <Vehicelpanel setpanel={setpanel} setconfirmRide={setconfirmRide} setvehiclepanel={setvehiclepanel} fare={fare} setvehicleType={setvehicleType}/>
        </div>
        <div ref={confirmRideRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 translate-y-full'>
          <ConfirmRide 
          fare={fare}
          pickup={pickup}
          destination={dropoff} setvehicleType={setvehicleType}
          setvehicleFound={setvehicleFound} setpanel={setpanel} setconfirmRide={setconfirmRide} setvehiclepanel={setvehiclepanel} createRide={createRide} />
        </div>
        <div ref={vehiclefoundRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 translate-y-full'>
          <LookingforDriver setvehicleFound={setvehicleFound} setpanel={setpanel} setconfirmRide={setconfirmRide} setvehiclepanel={setvehiclepanel} createRide={createRide} fare={fare}
          pickup={pickup}
          destination={dropoff} />
        </div>
        <div ref={waitingForDriverRef} className='fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12 translate-y-full'>
          <WaitingForDrivers waitingForDriver={waitingForDriver} />
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

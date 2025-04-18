'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CaptainProtectedRoute from '../captainprotected/page'; // Ensure this path is accurate
import { logoutUser } from '@/utils/logout';
import Link from 'next/link';
import 'remixicon/fonts/remixicon.css'
import CaptainDetail from '@/components/CaptainDeatil';
import Ridenotification from '@/components/Ridenotification';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ConfirmRidenotification from '@/components/ConfirmRidenotification';
const DriverPage = () => {
  const router = useRouter();
  const [ridenotifypopup, setridenotifypopup] = useState(true)
  const [ConfirmRidenotify, setConfirmridenotify] = useState(false)
  const ridenotifyRef = useRef(null)
  const confirmridenotifyRef = useRef(null)
  
  useGSAP(function(){
    if(ridenotifypopup){
  gsap.to(ridenotifyRef.current,{
    transform:"translate(0)",
  })}
   else{
    gsap.to(ridenotifyRef.current,{
      transform:"translateY(100%)"
    })
   }
  },[ridenotifypopup])
  useGSAP(function(){
    if(ConfirmRidenotify){
  gsap.to(confirmridenotifyRef.current,{
    transform:"translate(0)",
  })}
   else{
    gsap.to(confirmridenotifyRef.current,{
      transform:"translateY(100%)"
    })
   }
  },[ConfirmRidenotify])

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
        
        <div className='fixed p-6  top-0 flex items-center justify-between w-screen'>
          <img className='w-25'src="images/logo11.png" alt=''/>
          <Link onClick={()=>{
            logoutUser()
          }} href="/login/driverlogin" className=' h-10 w-10 bg-white flex item-center justify-center rounded-full'>
          <i className="text-3xl font-medium  ri-logout-box-r-line"></i>
        </Link>
        </div>
     <div className='h-3/5'>
        <img className='h-full w-full object-cover' src="https://www.medianama.com/wp-content/uploads/2018/06/Screenshot_20180619-112715.png.png"></img>

     </div>
      <div className='h-2/5 p-6'>
         <CaptainDetail/>

      </div>
      <div ref={ridenotifyRef} className=' fixed w-full z-10 bottom-0 bg-white px-3 py-6 '>
       <Ridenotification setridenotifypopup={setridenotifypopup} setConfirmridenotify={setConfirmridenotify}/>
     </div>
     <div ref={confirmridenotifyRef} className=' fixed w-full z-10 bottom-0 bg-white px-3 py-6 translate-y-full h-screen '>
       <ConfirmRidenotification setConfirmridenotify={setConfirmridenotify}/>
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

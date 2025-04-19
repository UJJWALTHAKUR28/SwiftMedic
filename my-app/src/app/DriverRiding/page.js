"use client"
import React, { useRef, useState } from 'react'
import CaptainProtectedRoute from '../captainprotected/page'
import { logoutUser } from '@/utils/logout';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import FinishRide from '@/components/FinishRide';
const DriverRidingPage = () => {
  const [finishRidepnael, setfinishRidepnael] = useState(false)
  const finishRidepnaelRef = useRef(null)
  useGSAP(function(){
    if(finishRidepnael){
  gsap.to(finishRidepnaelRef.current,{
    transform:"translate(0)",
  })}
   else{
    gsap.to(finishRidepnaelRef.current,{
      transform:"translateY(100%)"
    })
   }
  },[finishRidepnael])

    const handleLogout = async () => {
        try {
          await logoutUser('ambulancedriver/logout');
          router.push('/login/driverlogin');
        } catch (error) {
          console.error('Logout error:', error);
        }
      };

      if (isLoading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-xl font-medium">Loading driver data...</p>
          </div>
        );
      }
  return (
    <div className='h-screen relative'>
 
        <div className='fixed p-6  top-0 flex items-center justify-between w-screen'>
        
          <img className='w-25'src="images/logo11.png" alt=''/>
          <Link href="/driver">
  <div className='h-10 w-10 bg-white flex items-center justify-center rounded-full cursor-pointer'>
    <i className="text-3xl font-medium ri-logout-box-r-line"></i>
  </div>
</Link>

        </div>
     <div className='h-4/5'>
        <img className='h-full w-full object-cover' src="https://www.medianama.com/wp-content/uploads/2018/06/Screenshot_20180619-112715.png.png"></img>

     </div>
      <div className='h-1/5 p-6 bg-red-200 flex items-center justify-center gap-50 relative ' onClick={()=>{setfinishRidepnael(true)}}>
      <h5 onClick={()=>{}} className='p-3 text-center w-full absolute top-0 '> <i className='text-3xl  text-black-200 ri-arrow-down-wide-line'></i></h5>
       <h4 className='text-2xl font-semibold'> 4 KM away</h4>
       <button onClick={()=>{}} className='bg-green-500 text-white font-semibold  rounded-lg px-10 p-3 '> Complete Ride</button>
      </div>

      <div ref={finishRidepnaelRef} className=' fixed w-full z-10 bottom-0 bg-white px-3 py-6 translate-y-full h-screen '>
       <FinishRide setfinishRidepnael={setfinishRidepnael}/>
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
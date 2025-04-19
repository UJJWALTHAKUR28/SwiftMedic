"use client"
import React from 'react';
import { useDriver } from '@/app/context/captaincontext';

const CaptainDetail = () => {
  const { driverData } = useDriver();
  console.log("CaptainDetail received driver from context:", driverData);
  
  // Add a fallback display name to handle when driver data is loading or undefined
  const displayName = driverData?.fullname?.firstname +" "+ driverData?.fullname?.lastname || "Captain";
  
  return (
    <div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center justify-start gap-3 p-3'>
          <img 
            className="h-10 w-10 rounded-full object-cover" 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd1Bbwk_0T3PBzuNcxsaJ8unhXZaJspBzzTQ&s"
            alt="Profile"
          />
          <h4 className='text-xl font-semibold capitalize'>{displayName}</h4>
        </div>
        <div>
          <h4 className='text-3xl font-semibold mr-15'>Rs 500</h4>
          <p className='text-sm font-medium text-gray-600'>Earned</p>
        </div>
      </div>
      
      <div className='flex justify-center gap-10 p-3 items-start bg-gray-100 rounded-xl mt-6'>
        <div className='text-center'>
          <i className='mb-2 text-3xl font-thin ri-timer-2-line'/>
          <h5 className='text-lg font-medium'>10.2</h5>
          <p className='text-sm text-gray-600'>
            Hours Online
          </p>
        </div>
        <div className='text-center'>
          <i className='text-3xl font-thin mb-2 ri-speed-up-line'/>
          <h5 className='text-lg font-medium'>10.2</h5>
          <p className='text-sm text-gray-600'>
            Hours Online
          </p>
        </div>
        <div className='text-center'>
          <i className='text-3xl mb-2 font-thin ri-booklet-line'/>
          <h5 className='text-lg font-medium'>10.2</h5>
          <p className='text-sm text-gray-600'>
            Hours Online
          </p>
        </div>
      </div>
    </div>
  )
}

export default CaptainDetail
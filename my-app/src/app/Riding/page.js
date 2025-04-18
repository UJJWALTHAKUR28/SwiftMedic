"use client"
import Link from 'next/link'
import React from 'react'
import 'remixicon/fonts/remixicon.css'

const Riding = () => {
  return (
    <div className='h-screen'>
        
        <Link href="/user" className='fixed right-2 top-2 h-10 w-10 bg-white flex item-center justify-center rounded-full'>
        <i className="text-3xl font-medium  ri-home-5-line"></i>
        </Link>
     <div className='h-1/2'>
        <img className='h-full w-full object-cover' src="https://www.medianama.com/wp-content/uploads/2018/06/Screenshot_20180619-112715.png.png"></img>

     </div>
      <div className='h-1/2 p-4'>
      <div className='flex items-center justify-between'>
     <img className='h-24' src="images/2Q.png"/>
     <div className='text-right'>
     <h2 className='text-lg font-medium'>Driver Name</h2>
      <h4 className='text-xl font-semibold -mt-1 -mb-1'> driver no 343 </h4>
      <p className='text-sm text-gray-600'> basic ambulace</p>
     </div>
      
     </div>
     <div className='flex 
     flex-col 
     justify-between items-center gap-2  md:justify-center'>
      
      <div className='w-full mt-5 '>
       
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-map-pin-user-fill"></i>
        <div>
          <h3 className='text-lg fonr-medium'>562/11 -A</h3>
          <p className='text-base text=gray-600'> JAI HO, chandigarh</p>
        </div>
        </div>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-currency-line"></i>
        <div>
          <h3 className='text-lg fonr-medium'>RS/ 500</h3>
          <p className='text-base text=gray-600'> Cash Cash</p>
        </div>

        </div>

      </div>

     
     </div>
        <button className='w-full bg-green-600 text-white font-semibold p-2 rounded-lg'>Make a Payment</button>
        

      </div>
    </div>
  )
}

export default Riding
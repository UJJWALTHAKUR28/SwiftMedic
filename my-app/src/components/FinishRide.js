"use client"
import Link from 'next/link'
import React from 'react'

const FinishRide = (props) => {
  return (
    <div className=''>
        <h5 onClick={()=>{props.setfinishRidepnael
        (false)}} className='p-3 text-center w-full  absolute top-0'> <i className='text-3xl  text-gray-200 ri-arrow-down-wide-line'></i></h5> 
     <h3 className='font-bold text-2xl mb-5'>Finish Ride</h3>
    <div className='flex items-center justify-between p-3  border-cyan-500 border-3 mt-4 rounded-lg'>
     <div className='flex items-center gap-3 '>
        <img className='h-14 w-14 rounded-full object-cover' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbtwjeGSuGJ79h3tCl3qJaQwiH2l9b5rq6qw&s"/>
        <h2 className='text-sm font-medium'> User Name</h2>
     </div>
     <h5 className='text-lg font-semibold'> 2.2 Km</h5>
     </div>
     <div className='flex 
     flex-col 
     justify-between items-center gap-2  md:justify-center'>
      <div className='w-full mt-5 '>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-map-pin-fill"></i>
        <div>
          <h3 className='text-lg fonr-medium'>562/11 -A</h3>
          <p className='text-base text=gray-600'> JAI HO, chandigarh</p>
        </div>
        </div>
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
          <h3 className='text-lg font-medium'>RS 500</h3>
          <p className='text-base text=gray-600'> Cash Cash</p>
        </div>

        </div>

      </div>
      <div className='mt-6 w-full'>

    <Link href="/driver" passHref>
      <div className='w-full bg-green-500 text-white font-semibold py-3 rounded-lg mt-4 text-center'>
       Finish
      </div>
    </Link>
    <p className=' mt-10 text-xs'> Click on Finish If you have Completed the payment</p>
</div>

      
     </div></div>
  )
}

export default FinishRide
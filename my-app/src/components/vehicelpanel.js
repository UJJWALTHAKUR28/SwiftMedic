"use client"
import React from 'react'

const Vehicelpanel = (props) => {
  return (
    <div><h5 onClick={()=>{props.setpanel(false) ,props.setvehiclepanel(false)}} className='p-3 text-center w-full  absolute top-0'> <i className='text-3xl  text-gray-200 ri-arrow-down-wide-line'></i></h5> 
    <h3 className='text-2xl font-semibold mb-5'> Choose Emergency Vehicle</h3>
    <div onClick={()=>{props.setconfirmRide(true),props.setvehicleType('swiftbasic')}}  className="flex items-center justify-between w-full p-3 mb-3 rounded-xl border-2 border-transparent active:border-black">

    <img className='h-20' src="images/2Q.png"/>
     <div className=' w-[60%]'>

     <h4 className='font-medium text-xl'>SwiftBasic <span> <i className='ri-user-3-fill'>4</i></span></h4>
      <h5 className='font-medium text-sm'>10 mins away</h5>
      
      <p className='font-normal text-xs text-gray-600'>Affordable, compact rides for non-critical cases, like patient transfers or urgent basis.</p>
     </div>
     <h2 className='text-xl font-semibold mr-10'>
      
     ₹ {props.fare?.swiftbasic || '₹ 302'}</h2>
    </div>
    <div onClick={()=>{props.setconfirmRide(true),props.setvehicleType('swiftexpress')}
    }  className="flex items-center justify-between w-full p-3 mb-3 rounded-xl border-2 border-transparent active:border-black">

    <img className='h-20' src="images/2Q.png"/>
     <div className=' w-[60%]'>

     <h4 className='font-medium text-xl'>SwiftExpress <span> <i className='ri-user-3-fill'>4</i></span></h4>
      <h5 className='font-medium text-sm'>5 mins away</h5>
      
      <p className='font-normal text-xs text-gray-600'>Lightning-fast dispatch and triage.  Built for emergencies where rapid response is mission-critical.</p>
     </div>
     <h2 className='text-xl font-semibold mr-10'> ₹{props.fare?.swiftexpress || '₹ 602'}</h2>
    </div>
    <div onClick={()=>{props.setconfirmRide(true),props.setvehicleType('swiftrange')}}   className="flex items-center justify-between w-full p-3 mb-3 rounded-xl border-2 border-transparent active:border-black">

    <img className='h-20' src="images/2Q.png"/>
     <div className=' w-[60%]'>

     <h4 className='font-medium text-xl'>SwiftRange <span> <i className='ri-user-3-fill'>6</i></span></h4>
      <h5 className='font-medium text-sm'>10 mins away</h5>
      
      <p className='font-normal text-xs text-gray-600'>Long-distance ambulance service for intercity hospital transfers or rural patient pickups with extended-range comfort and support.</p>
     </div>
     <h2 className='text-xl font-semibold mr-8'>₹{props.fare?.swiftrange || '₹ 1002'}</h2>
    </div></div>
  )
}

export default Vehicelpanel
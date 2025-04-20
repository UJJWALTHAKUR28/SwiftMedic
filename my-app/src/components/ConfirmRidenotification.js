"use client"
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import 'remixicon/fonts/remixicon.css'

const ConfirmRidenotification = (props) => {
  const [OTP, setOTP] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  const submitHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate OTP
      if (!OTP || OTP.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP')
      }

      const token = localStorage.getItem('token')
      
      // Use the correct URL format for the GET request with query parameters
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/start-ride?rideId=${props.ride?._id}&otp=${OTP}`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start ride')
      }

      // Success - update UI
      if (typeof props.setConfirmridenotify === 'function') {
        props.setConfirmridenotify(false)
      }
      
      if (typeof props.setridenotifypopup === 'function') {
        props.setridenotifypopup(false)
      }
      
      if (typeof props.setrideStatus === 'function') {
        props.setrideStatus('started')
      }
      
      if (typeof props.setrideOtp === 'function') {
        props.setrideOtp(OTP)
      }
      
      // Save ride data before navigation
      if (typeof props.setRideData === 'function') {
        props.setRideData({
          ...props.ride,
          otp: OTP
        })
      }
      
      // Navigate to the riding page
      router.push('/DriverRiding')
    } catch (err) {
      console.error('Start ride error:', err)
      setError(err.message || 'Failed to start ride')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className=''>
        <h5 onClick={()=>{props.setConfirmridenotify(false)}} className='p-3 text-center w-full absolute top-0'> 
          <i className='text-3xl text-gray-200 ri-arrow-down-wide-line'></i>
        </h5> 
        <h3 className='font-bold text-2xl mb-5'>Confirm Ride</h3>
        
        <div className='flex items-center justify-between p-3 bg-red-400 mt-4 rounded-lg'>
          <div className='flex items-center gap-3'>
            <img className='h-14 w-14 rounded-full object-cover' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbtwjeGSuGJ79h3tCl3qJaQwiH2l9b5rq6qw&s" alt="User"/>
            <h2 className='text-sm font-medium capitalize'> 
              {props.ride?.user.fullname.firstname + " " + props.ride?.user.fullname.lastname}
            </h2>
          </div>
          <h5 className='text-lg font-semibold'> 2.2 Km</h5>
        </div>
        
        <div className='flex flex-col justify-between items-center gap-2 md:justify-center'>
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
              <i className="text-lg ri-map-pin-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>Pick-up</h3>
                <p className='text-base text-gray-600'> {props.ride?.pickup}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>Destination</h3>
                <p className='text-base text-gray-600'> {props.ride?.destination}</p>
              </div>
            </div>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
              <i className="text-lg ri-currency-line"></i>
              <div>
                <h3 className='text-lg font-medium'>₹{props.ride?.fare}</h3>
                <p className='text-base text-gray-600'>Cash Payment</p>
              </div>
            </div>
          </div>
          
          <div className='mt-6 w-full'>
            <form onSubmit={submitHandler}>
              <input 
                value={OTP} 
                onChange={(e) => setOTP(e.target.value)} 
                type='text' 
                placeholder='Enter 6-digit OTP from passenger'
                className='bg-[#eee] px-6 py-4 rounded-lg w-full mt-5 font-mono text-center text-xl tracking-wider'
                maxLength={6}
              />
              
              {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

              <button type="submit" disabled={isLoading} className='w-full mt-4'>
                <div className={`w-full ${isLoading ? 'bg-green-400' : 'bg-green-500'} text-white font-semibold py-3 rounded-lg text-center`}>
                  {isLoading ? 'Verifying...' : 'Start Ride'}
                </div>
              </button>

              <button 
                type="button"
                onClick={() => props.setConfirmridenotify(false)} 
                className='w-full bg-red-600 text-white font-semibold py-2 rounded-lg mt-3'
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
    </div>
  )
}

export default ConfirmRidenotification
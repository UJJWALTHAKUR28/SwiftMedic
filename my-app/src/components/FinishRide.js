"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/app/context/SocketContext'

const FinishRide = (props) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { sendMessage } = useSocket()

  const handleFinishRide = async () => {
    if (!props.rideData?._id) {
      alert("Cannot finish ride: missing ride information")
      return
    }

    try {
      setLoading(true)
      
      // Call the backend API to end the ride
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/end-ride`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rideId: props.rideData._id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to end ride')
      }

      // Send a socket message directly for redundancy
      sendMessage('message', {
        event: 'ride-ended',
        data: props.rideData
      })
      
      // Also send direct socket event
      sendMessage('ride-ended', props.rideData)
      
      // Dispatch DOM event for direct communication
      if (typeof window !== 'undefined') {
        // Create and dispatch a custom event
        const rideEndedEvent = new CustomEvent('rideEnded', {
          detail: {
            rideEnded: true,
            ride: props.rideData
          }
        })
        document.dispatchEvent(rideEndedEvent)
        
        // Try to directly update passenger's UI as well (if they're on the same domain)
        try {
          // Create a broadcast channel if supported
          if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('ride_events')
            bc.postMessage({
              event: 'ride-ended',
              data: props.rideData
            })
          }
        } catch (err) {
          console.error('Error broadcasting ride end:', err)
        }
      }

      // Clear ride data from localStorage
      localStorage.removeItem('currentRide')
      localStorage.removeItem('passengerDetails')
      
      // Close the panel and redirect to driver page
      props.setfinishRidepnael(false)
      router.push('/driver')
    } catch (error) {
      console.error('Error ending ride:', error)
      alert('Error ending ride: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className=''>
        <h5 onClick={()=>{props.setfinishRidepnael
        (false)}} className='p-3 text-center w-full  absolute top-0'> <i className='text-3xl  text-gray-200 ri-arrow-down-wide-line'></i></h5> 
     <h3 className='font-bold text-2xl mb-5'>Finish Ride</h3>
    <div className='flex items-center justify-between p-3  border-cyan-500 border-3 mt-4 rounded-lg'>
     <div className='flex items-center gap-3 '>
        <img className='h-14 w-14 rounded-full object-cover' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbtwjeGSuGJ79h3tCl3qJaQwiH2l9b5rq6qw&s"/>
        <h2 className='text-sm font-medium'> {props.rideData?.user?.fullname?.firstname || "Passenger"}</h2>
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
          <p className='text-base text=gray-600'> {props.rideData?.pickup || "Pickup location"}</p>
        </div>
        </div>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-map-pin-user-fill"></i>
        <div>
          <h3 className='text-lg fonr-medium'>562/11 -A</h3>
          <p className='text-base text=gray-600'> {props.rideData?.destination || "Destination location"}</p>
        </div>
        </div>
        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
        <i className="text-lg ri-currency-line"></i>
        <div>
          <h3 className='text-lg font-medium'>{props.rideData?.fare || "0"}</h3>
          <p className='text-base text=gray-600'> Cash Cash</p>
        </div>

        </div>

      </div>
      <div className='mt-6 w-full'>

    <button
      onClick={handleFinishRide}
      disabled={loading}
      className='w-full bg-green-500 text-white font-semibold py-3 rounded-lg mt-4 text-center'
    >
      {loading ? "Processing..." : "Finish"}
    </button>
    <p className='mt-10 text-xs'> Click on Finish If you have Completed the payment</p>
</div>

      
     </div></div>
  )
}

export default FinishRide
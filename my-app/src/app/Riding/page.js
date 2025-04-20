"use client"
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import 'remixicon/fonts/remixicon.css'
import { useRouter } from 'next/navigation'
import { useSocket } from '../context/SocketContext'
import LiveTracking from '@/components/LiveTracking'

const Riding = () => {
  const [rideData, setRideData] = useState(null)
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { socket, isConnected, receivemessage } = useSocket()

  // Debug logging
  useEffect(() => {
    console.log("🚨 RIDING PAGE: Mounted - Socket connected:", isConnected)
    
    // Add window-level debug function
    window.debugRideEnded = () => {
      console.log("🚨 MANUAL TRIGGER: Forcing ride-ended event")
      handleRideEndedAndRedirect({})
    }
    
    return () => {
      console.log("🚨 RIDING PAGE: Unmounted")
      delete window.debugRideEnded
    }
  }, [])

  // Shared handler function to ensure consistent behavior
  const handleRideEndedAndRedirect = (data) => {
    console.log('🚨 RIDE ENDED: Handler executed with data:', data)
    
    try {
      // Clear ride data
      console.log('🚨 RIDE ENDED: Clearing localStorage')
      localStorage.removeItem('currentRide')
      localStorage.removeItem('driverDetails')
      
      // Force immediate hard navigation (most reliable method)
      console.log('🚨 RIDE ENDED: Forcing navigation to /user with window.location')
      window.location.href = '/user'
      
      // Also try Next.js router as fallback
      console.log('🚨 RIDE ENDED: Also trying router.push')
      router.push('/user')
    } catch (error) {
      console.error('🚨 RIDE ENDED: Error in handler:', error)
    }
  }

  useEffect(() => {
    // Try to get ride data from localStorage or sessionStorage
    try {
      const storedRide = localStorage.getItem('currentRide')
      const storedDriver = localStorage.getItem('driverDetails')
      
      if (storedRide) {
        setRideData(JSON.parse(storedRide))
      }
      
      if (storedDriver) {
        setDriver(JSON.parse(storedDriver))
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading ride data:', error)
      setLoading(false)
    }
  }, [])

  // Primary event listening with all redundancy methods
  useEffect(() => {
    console.log('🚨 RIDE ENDED: Setting up all ride-ended event listeners')
    
    // Regular interval check for backend status changes
    const statusCheckInterval = setInterval(() => {
      if (rideData?._id) {
        console.log('🚨 POLLING: Checking ride status from backend')
        fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/status?rideId=${rideData._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
          .then(res => res.json())
          .then(data => {
            console.log('🚨 POLLING: Ride status check result:', data)
            if (data.status === 'completed') {
              console.log('🚨 POLLING: Detected completed status, redirecting')
              handleRideEndedAndRedirect(data)
            }
          })
          .catch(err => console.error('🚨 POLLING: Error checking ride status:', err))
      }
    }, 5000) // Check every 5 seconds
    
    // Handler for ride ended event
    const handleRideEnded = (data) => {
      console.log('🚨 SOCKET EVENT: Ride ended event received:', data)
      handleRideEndedAndRedirect(data)
    }
    
    // SOCKET METHOD 1: Using receivemessage from SocketContext
    if (receivemessage) {
      console.log('🚨 SOCKET CONFIG: Setting up receivemessage listener')
      receivemessage('ride-ended', handleRideEnded)
    } else {
      console.warn('🚨 SOCKET CONFIG: receivemessage function is not available!')
    }
    
    // SOCKET METHOD 2: Message event for redundancy
    const handleMessage = (data) => {
      console.log('🚨 SOCKET EVENT: Message received:', data)
      if (data.event === 'ride-ended') {
        console.log('🚨 SOCKET EVENT: Ride ended via message event:', data)
        handleRideEndedAndRedirect(data.data || data)
      }
    }
    
    if (receivemessage) {
      receivemessage('message', handleMessage)
    }
    
    // SOCKET METHOD 3: Direct socket.on listener as fallback
    if (socket) {
      console.log('🚨 SOCKET CONFIG: Setting up direct socket listener')
      socket.on('ride-ended', handleRideEnded)
      socket.on('message', handleMessage)
    } else {
      console.warn('🚨 SOCKET CONFIG: socket object is not available!')
    }
    
    // DOM METHOD 1: Event listener for direct DOM updates
    const domEventHandler = (event) => {
      console.log('🚨 DOM EVENT: rideEnded event received:', event.detail)
      if (event.detail && (event.detail.rideEnded || event.detail.event === 'ride-ended')) {
        handleRideEndedAndRedirect(event.detail.ride || event.detail.data || event.detail)
      }
    }
    
    document.addEventListener('rideEnded', domEventHandler)
    
    // DOM METHOD 2: BroadcastChannel for cross-tab communication
    let broadcastChannel
    try {
      if ('BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('ride_events')
        broadcastChannel.onmessage = (event) => {
          console.log('🚨 BROADCAST: Message received:', event.data)
          if (event.data.event === 'ride-ended') {
            handleRideEndedAndRedirect(event.data.data || event.data)
          }
        }
      }
    } catch (err) {
      console.error('🚨 BROADCAST: Error setting up broadcast channel:', err)
    }
    
    // Force check current status on mount
    if (rideData?._id) {
      console.log('🚨 INIT CHECK: Checking ride status on mount')
      // Initial status check
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/rides/status?rideId=${rideData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log('🚨 INIT CHECK: Initial ride status:', data)
          if (data.status === 'completed') {
            console.log('🚨 INIT CHECK: Detected completed status, redirecting')
            handleRideEndedAndRedirect(data)
          }
        })
        .catch(err => console.error('🚨 INIT CHECK: Error checking ride status:', err))
    }
    
    return () => {
      console.log('🚨 CLEANUP: Removing all ride-ended event listeners')
      
      // Clean up all listeners
      clearInterval(statusCheckInterval)
      
      if (socket) {
        socket.off('ride-ended')
        socket.off('message')
      }
      
      document.removeEventListener('rideEnded', domEventHandler)
      
      if (broadcastChannel) {
        broadcastChannel.close()
      }
    }
  }, [isConnected, socket, router, receivemessage, rideData])

  const getDriverName = () => {
    if (!driver) return 'Driver'
    
    if (typeof driver.fullname === 'string') {
      return driver.fullname
    }
    
    if (driver.fullname?.firstname || driver.fullname?.lastname) {
      return `${driver.fullname.firstname || ''} ${driver.fullname.lastname || ''}`.trim()
    }
    
    return 'Driver'
  }

  const getVehicleInfo = () => {
    if (!driver?.vehicle) return { type: 'Ambulance', plate: 'Vehicle No' }
    
    return {
      type: driver.vehicle.type || 'Ambulance',
      plate: driver.vehicle.plate || 'Vehicle No'
    }
  }

  const vehicleInfo = getVehicleInfo()

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading ride information...</div>
  }

  return (
    <div className='h-screen'>
      <Link href="/user" className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full z-10'>
        <i className="text-3xl font-medium ri-home-5-line"></i>
      </Link>
      
      <div className='h-1/2'>
        <LiveTracking />
      </div>
      
      <div className='h-1/2 p-4'>
        <div className='flex items-center justify-between'>
          <img className='h-24' src="/images/2Q.png" alt="Driver" />
          <div className='text-right'>
            <h2 className='text-lg font-medium'>{getDriverName()}</h2>
            <h4 className='text-xl font-semibold -mt-1 -mb-1'>{vehicleInfo.plate}</h4>
            <p className='text-sm text-gray-600'>{vehicleInfo.type}</p>
          </div>
        </div>
        
        <div className='flex flex-col justify-between items-center gap-2 md:justify-center'>
          <div className='w-full mt-5'>
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
              <i className="text-lg ri-map-pin-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>Pick-up</h3>
                <p className='text-base text-gray-600'>{rideData?.pickup || 'Loading...'}</p>
              </div>
            </div>
            
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
              <i className="text-lg ri-map-pin-user-fill"></i>
              <div>
                <h3 className='text-lg font-medium'>Destination</h3>
                <p className='text-base text-gray-600'>{rideData?.destination || 'Loading...'}</p>
              </div>
            </div>
            
            <div className='flex items-center gap-5 p-3 border-b-2 border-gray-300'>
              <i className="text-lg ri-currency-line"></i>
              <div>
                <h3 className='text-lg font-medium'>₹{rideData?.fare || '0'}</h3>
                <p className='text-base text-gray-600'>Cash Payment</p>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => window.debugRideEnded()} 
          className='w-full bg-green-600 text-white font-semibold p-2 rounded-lg mt-4'
        >
          Make a Payment
        </button>
      </div>
    </div>
  )
}

export default Riding
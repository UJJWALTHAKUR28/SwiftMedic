'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDriver } from '@/app/context/captaincontext';

const CaptainProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { driverData, setDriverData, isLoading, setIsLoading } = useDriver();

  useEffect(() => {
    // This effect will only run on the client side
    setIsClient(true);
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      router.push('/login/driverlogin');
      return;
    }
    
    // If we have a token, fetch the driver profile
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/ambulancedriver/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem('token');
          router.push('/login/driverlogin');
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        console.log("Driver profile data fetched:", data);
        
        // Make sure we're setting the correct data structure
        if (data && data.ambulancedriver) {
          setDriverData(data.ambulancedriver);
        } else if (data && data.driver) {
          setDriverData(data.driver);
        } else {
          console.error("Unexpected data structure:", data);
          setDriverData(data); // Set whatever data we received as a fallback
        }
      } catch (err) {
        console.error("Error fetching driver profile:", err.message);
        localStorage.removeItem('token');
        router.push('/login/driverlogin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, setDriverData, setIsLoading]);

  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-medium">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default CaptainProtectedRoute;
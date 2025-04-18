'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDriver } from '@/app/context/captaincontext'; // Make sure path is correct

const CaptainProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const { driverData, setDriverData, isLoading, setIsLoading } = useDriver();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login first');
      router.push('/login/driverlogin');
    } else {
      setIsClient(true);
      fetchProfile(token);
    }
  }, [router]);

  const fetchProfile = async (token) => {
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
      setDriverData(data.driver);
    } catch (err) {
      console.error(err.message);
      localStorage.removeItem('token');
      router.push('/login/driverlogin');
    } finally {
      setIsLoading(false);
    }
  };

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

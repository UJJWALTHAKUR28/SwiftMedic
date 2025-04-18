'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Optional: Export context if you want global access to user data
const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const UserProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      router.push('/login/loginuser');
    } else {
      fetchUserProfile(token);
    }
  }, [router]);

  const fetchUserProfile = async (token) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/profile`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Invalid token or failed to fetch profile');

      const data = await res.json();
      setUser(data.user); // Adjust according to API shape
      setIsClient(true);
    } catch (err) {
      console.error(err.message);
      localStorage.removeItem('token');
      router.push('/login/loginuser');
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProtectedRoute;

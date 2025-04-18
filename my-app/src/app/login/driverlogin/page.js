'use client';

import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDriver } from '@/app/context/captaincontext';

const DriverLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { setDriverData } = useDriver();

  const handleLogin = async () => {
    const formData = { email, password };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/ambulancedriver/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Login failed');
    }

    const data = await response.json();

    // Update context and localStorage
    setDriverData(data.driver);
    localStorage.setItem('token', data.token);
    router.push('/driver');

    return data;
  };

  const submitHandler = (e) => {
    e.preventDefault();

    toast.promise(
      handleLogin(),
      {
        loading: 'Logging in...',
        success: (data) => `Welcome Captain ${data.driver.email}`,
        duration: 4000,
        error: (err) => err.message || 'Login failed. Try again.',
      }
    );

    // Clear input fields
    setEmail('');
    setPassword('');
  };

  return (
    <div className="bg-cover bg-top bg-[url('/images/hello.png')]">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white h-[80vh] shadow-lg p-7 w-full max-w-md">
          <form onSubmit={submitHandler} className="w-full flex flex-col justify-center flex-grow">
            <div className="mb-8">
              <h3 className="text-4xl font-extrabold font-[sans-serif] mb-6 text-center">SWIFTMEDIC</h3>
              <h3 className="text-2xl font-bold mb-3">What's your email</h3>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="email"
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-3">Enter Password</h3>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="password"
                placeholder="password"
                required
              />
            </div>

            <Toaster position="top-right" />
            <button
              type="submit"
              className="w-full h-[9vh] flex items-center justify-center bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
            >
              Login
            </button>

            <div className="flex items-center justify-center mt-4">
              <span className="text-lg">Join us!</span>
              <Link href="/login/driversignup" className="text-blue-500 font-bold ml-2">
                Register as Driver
              </Link>
            </div>
          </form>

          <Link
            href="/login/loginuser"
            className="mt-6 text-center text-xl text-white p-5 rounded-2xl bg-amber-700 w-full hover:bg-amber-500 transition"
          >
            Sign In as User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;

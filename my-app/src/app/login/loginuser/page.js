"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/usercontext';
const LoginUser = () => {
  const [email, setemail] = useState('')
  const [password, setpassword] = useState('')
  const [Data, setData] = useState({})
  const router = useRouter(); // Initialize the router
  const {user, setUser} = useUser(); // Use the context to manage user state
  const submitHandler = (e) => {
    e.preventDefault();
    const formData = { email:email, password:password };
    
    const res = fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then((res) => {
      if (res.ok) {
        return res.json(); // ✅ Correct here
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .then((data) => {
      setUser(data.user);
      localStorage.setItem('token', data.token); // Store token in local storage
      alert("Login Successfully");
      router.push('/user'); // ✅ Navigate after success
    })
    setemail('');
    setpassword('');
  };
  return (
    <div className="bg-cover bg-top bg-gradient-to-br from-red-950 via-black to-red-900  overflow-hidden h-screen w-full relative">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white h-[80vh] shadow-lg p-7 w-full max-w-md">
          
          <form onSubmit={(e)=>{submitHandler(e)}}  className="w-full flex flex-col justify-center flex-grow">
            <div className="mb-8">
              <h3 className="text-4xl font-extrabold font-[sans-serif] mb-6 text-center">SWIFTMEDIC</h3>
              <h3 className="text-2xl font-bold mb-3">What's your email</h3>
              <input value={email} onChange={(e) => setemail(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="email"
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-3">Enter Password</h3>
              <input value={password} onChange={(e)=>setpassword(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="password"
                placeholder="password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-[9vh] flex items-center justify-center bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
            >
              Login
            </button>
            <></>
            <div className="flex items-center justify-center mt-4">
              <span className="text-lg">Don't have an account?</span>
              <Link href="/login/signupuser" className="text-blue-500 font-bold ml-2">
                Sign Up
              </Link>
            </div>
          </form>

          {/* Sign Up Button (outside form but inside white card) */}
          <Link href="/login/driverlogin" className="mt-6 text-center text-xl text-white p-5 rounded-2xl bg-green-700 w-full hover:bg-green-500 transition">
            Sign In as Driver
          </Link >
        </div>
      </div>
    </div>
  );
};

export default LoginUser;

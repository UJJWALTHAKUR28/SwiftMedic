"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/usercontext'; // Adjust the import path as necessary
const signupuser = () => {
  const [email, setemail] = useState('')
  const [firstname, setfirstname] = useState('')
  const [lastname, setlastname] = useState('')
  const [password, setpassword] = useState('')
  const [Data, setData] = useState({})
  const router = useRouter(); // Initialize the router
  const {user, setUser} = useUser(); // Use the context to manage user state
  const submitHandler = async (e) => {
    e.preventDefault();
  
    const formData = {
      fullname: {
        firstname: firstname,
        lastname: lastname
      },
      email: email,
      password: password,
    };
  
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (res.ok) {
        const data = await res.json(); // ✅ Correct here
        setUser(data.user);
        localStorage.setItem('token', data.token); // Store token in local storage
        alert("User Created Successfully");
        router.push('/login/loginuser'); // ✅ Navigate after success
      } else {
        const errorText = await res.text();
        console.error('Registration failed:', errorText);
        alert('Failed to create user: ' + res.statusText);
      }
    } catch (err) {
      console.error('Request failed:', err);
      alert('An error occurred while creating user.');
    }

  
    
    // If you still need this state elsewhere
    setfirstname('');
    setlastname('');
    setemail('');
    setpassword('');
  };
  return (
    <div className="bg-cover bg-top bg-gradient-to-br from-red-900 via-black to-red-950 h-screen w-full relative overflow-hidden">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white h-[99vh] shadow-lg p-7 w-full max-w-md">
          
          <form onSubmit={(e)=>{submitHandler(e)}}  className="w-full flex flex-col justify-center flex-grow">
          <div className="mb-3">
              <h3 className="text-4xl font-extrabold font-[sans-serif] mb-4 text-center">SWIFTMEDIC</h3>
              <h3 className="text-xl font-bold mb-2">First Name *</h3>
              <input value={firstname} onChange={(e) => setfirstname(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="text"
                placeholder="First Name"
                required
              />
            </div>
            <div className="mb-2">
              <h3 className="text-xl font-bold mb-2">Last Name</h3>
              <input value={lastname} onChange={(e) => setlastname(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="text"
                placeholder="Last Name"
              />
            </div>
            <div className="mb-3">
              <h3 className="text-xl font-bold mb-2">What's your email *</h3>
              <input value={email} onChange={(e) => setemail(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="email"
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">Enter Password *</h3>
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
              Sign Up
            </button>
            <></>
            <div className="flex items-center justify-center mt-2">
              <span className="text-lg">Have an Account?</span>
              <Link href="/login/loginuser" className="text-blue-500 font-bold ml-2">
                Sign In
              </Link>
            </div>
          </form>
          <p className='mb-4'> Fields marked with an asterisk (*) are mandatory.*</p>
          {/* Sign Up Button (outside form but inside white card) */}
          <Link href="/login/driversignup" className=" text-center text-xl text-white p-4 rounded-2xl bg-green-700 w-full hover:bg-green-500 transition">
            Sign Up as Driver
          </Link >
        </div>
      </div>
    </div>
  );
}

export default signupuser
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/usercontext'; // Make sure this import matches your actual context path

const driversignup = () => {
  const vehicleTypes = [
    'Basic Life Support (BLS)',
    'Advanced Life Support (ALS)',
    'Mobile Intensive Care Unit (MICU)',
    'Air Ambulance',
    'Patient Transport Ambulances',
    'Neonatal Ambulance',
    'Pediatric Ambulance',
    'Critical Care Transport',
    'Non-Emergency Medical Transport (NEMT)',
    'Event Medical Services',
    'Rescue Ambulance',
    'Fire Rescue Ambulance',
    'Community Paramedicine Ambulance'
  ];

  // Individual state variables for each input field
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  
  // Vehicle information
  const [vehicleType, setVehicleType] = useState('Basic Life Support (BLS)');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('3');

  const router = useRouter();
  const { setUser } = useUser(); // Get the user context
  
  const submitHandler = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (firstname.length < 3) {
      alert("First name must be at least 3 characters");
      return;
    }
    
    if (password.length < 12) {
      alert("Password must be at least 12 characters");
      return;
    }
    
    if (phonenumber.length < 10) {
      alert("Phone number must be at least 10 digits");
      return;
    }
    
    if (vehiclePlate.length < 5) {
      alert("Vehicle plate must be at least 5 characters");
      return;
    }
    
    const year = parseInt(vehicleYear);
    if (isNaN(year) || year < 2010) {
      alert("Vehicle year must be 2010 or later");
      return;
    }
    
    // Construct formData object with correct structure
    const formData = {
      fullname: {  // Changed from 'username' to 'fullname' to match backend schema
        firstname: firstname,
        lastname: lastname
      },
      email: email,
      password: password,
      phonenumber: phonenumber,
      vehicle: {
        plate: vehiclePlate,
        type: vehicleType,
        model: vehicleModel,
        color: vehicleColor,
        year: parseInt(vehicleYear),
        capacity: parseInt(vehicleCapacity)
      }
    };
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/ambulancedriver/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('token', data.token); // Store token in local storage
        alert("User Created Successfully");
        router.push('/login/driverlogin');
      } else {
        // Improved error handling to show the actual validation errors
        const errorData = await res.json();
        console.error('Registration failed:', errorData);
        
        if (errorData.errors && errorData.errors.length > 0) {
          // Show the first error message
          alert('Registration failed: ' + errorData.errors[0].msg);
        } else {
          alert('Failed to create user: ' + res.statusText);
        }
      }
    } catch (err) {
      console.error('Request failed:', err);
      alert('An error occurred while creating user.');
    }
  };

  return (
    <div className="bg-cover bg-top bg-[url('/images/hello.png')]">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="flex flex-col items-center justify-center rounded-lg bg-white shadow-lg p-7 w-full max-w-md overflow-y-auto min-h-screen">
          <form onSubmit={submitHandler} className="w-full flex flex-col justify-center">
            {/* Existing fields */}
            <div className="mb-3">
              <h3 className="text-4xl font-extrabold font-[sans-serif] mb-4 text-center">SWIFTMEDIC</h3>
              <h3 className="text-2xl font-bold mb-2">Responders</h3>
              <h3 className="text-xl font-bold mb-2">First Name *</h3>
              <input
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full"
                type="text"
                placeholder="First Name"
                required
              />
            </div>
            <div className="mb-2">
              <h3 className="text-xl font-bold mb-2">Last Name</h3>
              <input 
                value={lastname} 
                onChange={(e) => setLastname(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="text"
                placeholder="Last Name"
              />
            </div>
            <div className="mb-3">
              <h3 className="text-xl font-bold mb-2">What's your email *</h3>
              <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="email"
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="mb-3">
              <h3 className="text-xl font-bold mb-2">Password *</h3>
              <input 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:ring-2 focus:ring-black transition"
                type="password"
                placeholder="Password"
                required
              />
            </div>
            {/* Additional fields */}
            <div className="mb-3">
              <h3 className="text-xl font-bold mb-2">Phone Number *</h3>
              <input
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full"
                type="tel"
                placeholder="Phone Number"
                required
                minLength={10}
              />
            </div>

            {/* Vehicle Information */}
            <h3 className="text-xl font-bold mb-2">Vehicle Information</h3>
            
            <div className="mb-3">
              <h3 className="text-lg font-bold mb-2">Vehicle Type *</h3>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full"
                required
              >
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <h3 className="text-lg font-bold mb-2">License Plate *</h3>
              <input
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="bg-[#eeeeee] rounded px-4 py-3 border w-full"
                type="text"
                placeholder="License Plate"
                required
                minLength={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-3">
                <h3 className="text-lg font-bold mb-2">Model *</h3>
                <input
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="bg-[#eeeeee] rounded px-4 py-3 border w-full"
                  type="text"
                  placeholder="Vehicle Model"
                  required
                />
              </div>

              <div className="mb-3">
                <h3 className="text-lg font-bold mb-2">Color *</h3>
                <input
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="bg-[#eeeeee] rounded px-4 py-3 border w-full"
                  type="text"
                  placeholder="Vehicle Color"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-3">
                <h3 className="text-lg font-bold mb-2">Year *</h3>
                <input
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                  className="bg-[#eeeeee] rounded px-4 py-3 border w-full"
                  type="number"
                  min="2010"
                  placeholder="Vehicle Year"
                  required
                />
              </div>

              <div className="mb-3">
                <h3 className="text-lg font-bold mb-2">Capacity *</h3>
                <input
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                  className="bg-[#eeeeee] rounded px-4 py-3 border w-full"
                  type="number"
                  min="3"
                  placeholder="Vehicle Capacity"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-[9vh] bg-black text-white rounded-lg text-lg font-semibold hover:bg-gray-800 transition mt-4"
            >
              Sign Up
            </button>

            <div className="flex items-center justify-center mt-4">
              <span className="text-lg">Have an Account?</span>
              <Link href="/login/driverlogin" className="text-blue-500 font-bold ml-2">
                Sign In
              </Link>
            </div>
          </form>
          <p className='mt-4 mb-4'>Fields marked with an asterisk (*) are mandatory.</p>
        </div>
      </div>
    </div>
  );
}

export default driversignup;
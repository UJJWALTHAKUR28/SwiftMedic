'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import 'remixicon/fonts/remixicon.css';

const HOME = () => {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-950 via-black to-red-900 text-white overflow-hidden px-4 flex flex-col justify-center items-center">
      
      {/* Animated Blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[600px] h-[600px] bg-emerald-400/20 blur-[150px] rounded-full top-[-20%] left-[-10%] animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] bg-sky-500/20 blur-[130px] rounded-full bottom-[-15%] right-[-5%] animate-pulse delay-300"></div>
        <div className="absolute w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full top-[50%] left-[40%] animate-pulse delay-500"></div>
      </div>

      {/* Hero Content */}
      <motion.div 
        className="text-center max-w-4xl mx-auto"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 text-transparent bg-clip-text">
          SwiftMedic: Intelligent Medical Logistics
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Manage emergency logistics, track drivers, and deliver medical aid with real-time intelligence and next-gen infrastructure.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-6">
          <motion.button
            onClick={() => router.push('/login/loginuser')}
            className="px-8 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xl hover:shadow-2xl transition-transform transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
          >
            User Login
          </motion.button>
          <motion.button
            onClick={() => router.push('/login/driverlogin')}
            className="px-8 py-3 text-lg font-semibold bg-green-500 hover:bg-green-600 rounded-lg shadow-xl hover:shadow-2xl transition-transform transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
          >
            Driver Login
          </motion.button>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div 
        className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {[
          {
            title: 'Live Dispatch & Routing',
            desc: 'Auto-assign drivers based on proximity and criticality using real-time geolocation.'
          },
          {
            title: 'Driver & Patient Portals',
            desc: 'Seamless portals for both ends, designed for mobile-first use and clarity.'
          },
          {
            title: 'Scalable Infra + Security',
            desc: 'Built with secure APIs, GDPR/HIPAA-ready flows, and scalable cloud backends.'
          }
        ].map((f, i) => (
          <motion.div
            key={i}
            className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg hover:shadow-2xl transition-transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-2xl font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-gray-300">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Navigation Links Footer */}
      <div className="mt-16 text-sm text-gray-400 flex flex-wrap gap-4 justify-center">
        
        <Link href="/login/signupuser" className="hover:text-white">User Signup</Link>
        <Link href="/login/driversignup" className="hover:text-white">Driver Signup</Link>
        
      </div>
    </div>
  );
};

export default HOME;

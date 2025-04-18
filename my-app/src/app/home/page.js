'use client';
import React from 'react';
import Link from 'next/link';

const Home = () => {
  return (
    <div className="bg-cover bg-top bg-[url('https://png.pngtree.com/background/20230425/original/pngtree-traffic-light-has-various-colors-changing-in-an-urban-setting-picture-image_2472126.jpg')] relative w-full min-h-screen  flex flex-col">
      {/* Header Section */}
      <div className="w-full">
        {/* Mobile View: Logo Full Width */}
        <div className="md:hidden h-[20vh] w-full flex items-center justify-center "></div>

        {/* Desktop View: Logo Left, Text Center */}
        <div className="hidden md:flex items-center justify-between px-6 py-4  relative">
          <img
            src="/images/logo1.png"
            alt="Ambulance Logo"
            className="h-[60px] w-auto object-contain"
          />
          <h1 className="text-2xl font-bold text-center w-full absolute left-0 right-0 mx-auto text-white">
            MediReach Pvt. Ltd.
          </h1>
        </div>

        {/* Mobile Company Name under Logo */}
        <div className="md:hidden w-full text-center mt-2">
          <h1 className="text-xl font-semibold text-white">
            MediReach Pvt. Ltd.
          </h1>
        </div>
      </div>

      {/* Title */}
      <div className="flex-grow flex items-center justify-center ">
        <h2 className="text-white text-2xl md:text-4xl font-bold text-center px-4 transform translate-y-[70px]">
          Ambulance Booking & Tracking System
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-end">
        {/* Mobile CTA Section */}
        <div className="md:hidden px-4 pb-8">
          <div className="bg-white h-[26vh] rounded-xl px-6 py-8 shadow-md items-center justify-center flex flex-col">
            <h2 className="text-black font-bold text-[22px] text-center mb-6">
              Get started with US
            </h2>
            <div className="flex justify-center w-[70%] bg-black rounded-xl py-2 px-4 mb-4 items-center align-center h-[10vh]">
              <Link href="/login/loginuser" passHref legacyBehavior>
                <a className=" text-white py-4 px-20 rounded-full flex items-center gap-2 active:bg-gray-800 transition-all duration-200">
                  <span className="text-[17px] font-medium">Continue</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Section */}
        <div className="hidden md:flex justify-center items-center  flex-grow">
          <div className="space-y-4 w-full max-w-md ">
            <div className="bg-white h-[25vh] rounded-3xl p-6 shadow-md justify-center flex flex-col items-center">
              <h2 className="text-black font-bold mb-4 text-4xl">
                Get Started with US
              </h2>
              <Link href="/login/loginuser" passHref legacyBehavior>
                <a className="w-[20vw] h-[8vh] bg-black text-white py-6 text-3xl rounded-xl items-center justify-center text-center flex hover:bg-gray-800 transition">
                  Continue
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

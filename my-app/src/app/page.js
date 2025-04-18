"use client"
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'
import 'remixicon/fonts/remixicon.css'
const HOME = () => {
  return (
    <div className='bg-amber-300'>
      <Link href="/home">Home</Link>
      <Link href="/login/signupuser">Signup</Link>
      <Link href="/login/loginuser">Login</Link>
      <Link href="/login/driverlogin">Driver Login</Link>
      <Link href="/login/signupdriver">Driver Signup</Link>
    </div>
  )
}

export default HOME
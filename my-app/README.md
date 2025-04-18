# SwiftMedic - Emergency Medical Transport App

A Next.js application for emergency medical transport services, connecting users with ambulance drivers.

**Note: This project is still in active development**

Current Status:
- ✅ User/Driver Authentication (Login/Signup) - Fully connected with backend
- ✅ Protected Route Implementation - Complete
- ✅ User/Driver Context Management - Functional
- 🚧 Ride Booking Features - In Progress
- 🚧 Real-time Location Tracking - In Progress
- 🚧 Payment Integration - Pending
- 🚧 Live Driver Matching - Using mock data

The core authentication and route protection are fully functional and connected to the backend API. However, the ride booking, tracking, and payment features are currently using placeholder data for development purposes.
## Project Structure

### Core Pages & Routes

#### Public Routes
- `/` - Landing page with navigation options
- `/home` - Main homepage with app introduction and "Get Started" button
- `/login/loginuser` - User login page
- `/login/signupuser` - User registration page 
- `/login/driverlogin` - Driver login portal
- `/login/driversignup` - Driver registration with vehicle details

#### Protected Routes
- `/user` - Main user dashboard
  - Shows map interface
  - Location search functionality
  - Vehicle type selection
  - Ride booking flow
- `/driver` - Driver dashboard
  - Live map view
  - Ride notifications
  - Booking acceptance
- `/Riding` - User's active ride view
  - Live location tracking
  - Driver details
  - Payment information
- `/DriverRiding` - Driver's active ride view
  - Navigation
  - Ride completion flow

### Key Components

#### Location & Booking
- `LocationSearchPanel` - Search interface for pickup/dropoff locations
- `VehiclePanel` - Vehicle type selection with pricing
- `ConfirmRide` - Ride confirmation interface
- `LookingForDriver` - Loading state while finding driver
- `WaitingForDriver` - Shows matched driver details

#### Driver Components  
- `CaptainDetail` - Driver profile and stats
- `RideNotification` - New booking alerts
- `ConfirmRidenotification` - Booking acceptance flow
- `FinishRide` - Ride completion interface

### Context & Authentication

The app uses React Context for state management:
- `UserContext` - Manages user authentication state
- `DriverContext` - Manages driver authentication state

Protected routes are wrapped with:
- `UserProtectedRoute` - For user-only pages
- `CaptainProtectedRoute` - For driver-only pages

## Features

### User Features
- Location search with suggestions
- Multiple ambulance type selection
- Real-time fare estimation
- Live ride tracking
- Secure payment processing
- Ride history

### Driver Features  
- Live ride notifications
- Booking acceptance/rejection
- Navigation assistance
- Ride completion workflow
- Earnings tracking
- Profile management

## Environment Setup

Create a `.env` file with:

```env
NEXT_PUBLIC_BASE_API_URL=your_api_url

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start


Pages & Routing Structure
Public Routes
/ - Landing page with navigation links to:

Home
User Signup/Login
Driver Signup/Login
/home - Main homepage with:

Company branding
"Get Started" CTA button
Responsive mobile/desktop layouts
Authentication Routes
/login/loginuser - User login
/login/signupuser - User registration
/login/driverlogin - Driver login
/login/driversignup - Driver registration
Protected Routes
Protected by authentication middleware:

User Routes
Protected by UserProtectedRoute:

/user - User dashboard with:
Location search
Vehicle selection
Ride booking flow
/Riding - Active ride view for users
Driver Routes
Protected by CaptainProtectedRoute:

/driver - Driver dashboard with:
Ride notifications
Profile details
/DriverRiding - Active ride view for drivers
Route Protection
Uses context providers:

UserProvider for user auth state
DriverProvider for driver auth state
Protected routes check for:

Valid JWT token in localStorage
Valid user/driver profile from API
Redirects to login if unauthorized
Layout
layout.js wraps all routes with:
Font providers
Auth context providers
Global styles
The app uses Next.js 13+ app router with:

File-based routing
Client-side navigation
Protected route middleware
Shared layouts
Authentication contexts



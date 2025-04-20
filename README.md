SwiftMedic
SwiftMedic is an ambulance booking and real-time tracking system. It allows users to request ambulances, track their rides, and manage user and driver accounts. The project consists of a Node.js/Express backend and a Next.js frontend.

Features
User registration and authentication (for both users and ambulance drivers)
Book an ambulance and track its location in real-time
Driver dashboard for managing rides
Admin/captain dashboard for overseeing operations
Secure REST API with JWT authentication
Real-time communication using Socket.IO
Interactive maps for live tracking (Google Maps or similar)
Responsive frontend built with Next.js

Project Structure
swiftmedic/
│
├── backend/                # Node.js/Express backend
│   ├── controllers/        # Route controllers
│   ├── db/                 # Database connection
│   ├── middlewares/        # Express middlewares
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── services/           # Business logic
│   ├── App.js
│   ├── server.js
│   ├── socket.js
│   └── package.json
│
├── my-app/                 # Next.js frontend
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   ├── package.json
│   └── ...other config files
│
└── README.md

Requirements
Node.js (v18+ recommended)
npm or yarn
MongoDB (local or cloud, e.g., MongoDB Atlas)
Google Maps API key (for map features)
(Optional) .env file for environment variables
Getting Started
1. Clone the repository
git clone https://github.com/yourusername/swiftmedic.git
cd swiftmedic

 Backend Setup
cd backend
npm install
Create a .env file in the backend directory:
PORT=5000
MONGODB_URI=mongourl
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
Start the backend server:
npm start
cd ../my-app
npm install
Create a .env.local file in the my-app directory:

Example .env.local file for frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
Start the frontend development server:

Visit http://localhost:3000 in your browser.

Usage
Register as a user or ambulance driver.
Users can book ambulances and track their rides.
Drivers can view and accept ride requests.
Admin/captain can monitor all rides and drivers.
Scripts
updateDriverLocations.js: Utility to update driver locations (for testing/demo).
test-socket-client.js: Test client for Socket.IO.
Technologies Used
Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT
Frontend: Next.js, React, Google Maps API
Styling: CSS Modules/PostCSS
SwiftMedic Backend API
SwiftMedic is a real-time emergency medical transport system backend that connects patients with nearby ambulance services. It supports user authentication, driver management, ride creation, location intelligence, and real-time communication.

🛠 Tech Stack
Node.js v16+

Express.js

MongoDB v6.0+ (via Mongoose)
s
JWT Authentication (with token blacklisting)

Socket.IO for real-time features

Google Maps API for location services

Swagger / OpenAPI for API documentation

express-validator, bcrypt, Helmet, CORS, Rate Limiting

📁 Project Structure
csharp
Copy
Edit
backend/
├── src/
│   ├── config/          # App and DB configuration
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic (maps, rides, etc.)
│   ├── middleware/      # Auth, error, and validation middleware
│   ├── utils/           # Helper utilities
│  
├── app.js               # Express app setup
└── server.js            # Server entry point
🚀 Getting Started
1. Clone and Install
bash
Copy
Edit
git clone
cd swiftmedic-backend
npm install
2. Setup Environment
Create a .env file in the root with the following variables:

ini
Copy
Edit
PORT=3000
DB_CONNECT=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
Use .env.example for reference and never commit .env files.

3. Start the Development Server
bash
Copy
Edit
npx nodemon
🔐 Authentication
JWT-based (Bearer or HTTP-only cookie)

Passwords hashed using bcrypt

Token blacklisting for secure logout

Role-based access control (user, driver)

🌍 Implemented API Endpoints
👤 User Management (/users)

Method	Endpoint	Description
POST	/register	Register new user
POST	/login	User login
GET	/profile	Get user profile
GET	/logout	Logout user
🚑 Driver Management (/ambulancedriver)

Method	Endpoint	Description
POST	/register	Register driver
POST	/login	Driver login
GET	/profile	Get driver profile
GET	/logout	Logout driver
📦 Booking Management (/rides)

Method	Endpoint	Description
POST	/create	Create a ride
GET	/get-fare	Calculate ride fare
🗺️ Location Services (/maps)

Method	Endpoint	Description
GET	/get-coordinates	Convert address to coordinates
GET	/get-distance-time	Calculate distance and ETA
GET	/get-suggestions	Autocomplete address search
🧠 Models Overview
User Model
Full name

Email (unique)

Password (hashed)

Socket ID (for real-time comms)

Ambulance Driver Model
Full name

Email

Password

Phone number

Vehicle details

Current status

Ride Model
User reference

Driver reference

Pickup & destination

Fare

Status

Payment details

OTP verification

Blacklisted Token Model
Token string

Timestamp

🧰 Services
Map Service — Google Maps API integration for coordinates, ETA, and suggestions

Ride Service — Distance-based fare calculation and ride status tracking

🛡️ Security Features
Bcrypt password hashing

JWT expiration & blacklisting

Role-based route protection

Input validation (express-validator)

Helmet for secure headers

CORS & XSS protection

📄 License
Licensed under the MIT License. See the LICENSE file.

✅ Ready for deployment and open to enhancement — reach out for .env.example, Swagger YAML, Dockerfile, or CI/CD pipelines.

Let me know if you want this auto-exported as a Markdown file.
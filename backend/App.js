const express = require('express');
const cors = require('cors');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const cookieParser = require('cookie-parser');
const app = express();
const ambulancedriverRoutes = require('./routes/ambulancedriver.routes');
const mapRoutes =require('./routes/maps.routes')
const rideRoutes =require('./routes/ride.routes')
// Load env vars early
require('dotenv').config();
app.use(cors({
    origin: "*",
    credentials: true
}));
// Middleware
app.use(cors());
app.use(express.json()); // If expecting JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // If expecting cookies
// If expecting form data
// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use(express.json());
app.use('/users', userRoutes);
app.use('/ambulancedriver', ambulancedriverRoutes);
app.use('/maps',mapRoutes)
app.use('/rides',rideRoutes);
// Connect to DB
connectToDb();
console.log('JWT Secret:', process.env.JWT_SECRET);

module.exports = app;

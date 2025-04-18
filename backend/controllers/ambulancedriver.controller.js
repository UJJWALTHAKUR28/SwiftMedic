const { validationResult } = require('express-validator');
const AmbulancedriverModel = require('../models/ambulancedriver.model');
const ambulancedriverService = require('../services/ambulancedriver.service');
const BlacklistToken = require('../models/BlacklistToken.model');
const { authDriver } = require('../middlewares/auth.middleware');

module.exports.registerAmbulancedriver = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { fullname, email, password, vehicle, phonenumber } = req.body;

        const existing = await AmbulancedriverModel.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Driver already exists' });

        const hashedPassword = await AmbulancedriverModel.hashPassword(password);

        const ambulancedriver = await ambulancedriverService.createAmbulancedriver({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword,
            phonenumber,
            vehicle
        });

        const token = ambulancedriver.generateAuthToken();
        res.status(201).json({ token, ambulancedriver });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Registration error' });
    }
};

module.exports.loginAmbulancedriver = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { email, password } = req.body;

        const ambulancedriver = await AmbulancedriverModel.findOne({ email }).select('+password');
        if (!ambulancedriver || !(await ambulancedriver.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = ambulancedriver.generateAuthToken();
        res.cookie('token', token);
        res.status(200).json({ token, ambulancedriver });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Login error' });
    }
};

module.exports.getAmbulancedriverProfile = async (req, res) => {
    try {
        const ambulancedriver = await AmbulancedriverModel.findById(req.user._id).select('-password');
        if (!ambulancedriver) {
            return res.status(404).json({ message: 'Ambulance driver not found' });
        }
        res.status(200).json({ ambulancedriver });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};


module.exports.logoutAmbulancedriver = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    await new BlacklistToken({ token }).save();  // Save token to blacklist
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

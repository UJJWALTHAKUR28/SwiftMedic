const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ambulancedriver = require('../controllers/ambulancedriver.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const vehicleTypes = [ 'Basic Life Support (BLS)', 'Advanced Life Support (ALS)', 'Mobile Intensive Care Unit (MICU)', 'Air Ambulance', 'Patient Transport Ambulances', 'Neonatal Ambulance', 'Pediatric Ambulance', 'Critical Care Transport', 'Non-Emergency Medical Transport (NEMT)', 'Event Medical Services', 'Rescue Ambulance', 'Fire Rescue Ambulance', 'Community Paramedicine Ambulance' ];

router.post('/register', [
    body('email').isEmail().withMessage('Enter valid email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name ≥ 3 characters'),
    body('password').isLength({ min: 12 }).withMessage('Password ≥ 12 characters'),
    body('phonenumber').isLength({ min: 10 }).withMessage('Phone ≥ 10 digits'),
    body('vehicle.plate').isLength({ min: 5 }),
    body('vehicle.type').isIn(vehicleTypes),
    body('vehicle.model').isLength({ min: 3 }),
    body('vehicle.color').isLength({ min: 3 }),
    body('vehicle.year').isInt({ min: 2010 }),
    body('vehicle.capacity').isInt({ min: 1 }),
], ambulancedriver.registerAmbulancedriver);

router.post('/login', [
    body('email').isEmail(),
    body('password').isLength({ min: 12 }),
], ambulancedriver.loginAmbulancedriver);

router.get('/profile', authMiddleware.authDriver(), ambulancedriver.getAmbulancedriverProfile);
router.get('/logout', authMiddleware.authDriver, ambulancedriver.logoutAmbulancedriver);

module.exports = router;

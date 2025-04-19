const express =require('express'
)
const router = express.Router()
const {body,query}= require('express-validator')
const rideController =require('../controllers/ride.controller');
const authMiddleware=require('../middlewares/auth.middleware');
const validVehicleTypes = ['swiftbasic', 'swiftexpress', 'swiftrange'];

router.post('/create', [
    authMiddleware.authUser,
    body('pickup')
        .notEmpty()
        .isString()
        .trim()
        .isLength({ min: 3, max: 300 })
        .withMessage('Pickup address must be between 3 and 100 characters'),
    body('destination')
        .notEmpty()
        .isString()
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage('Destination address must be between 3 and 100 characters'),
    body('vehicleType')
        .notEmpty()
        .isString()
        .trim()
        .isIn(validVehicleTypes)
        .withMessage(`Vehicle type must be one of: ${validVehicleTypes.join(', ')}`)
], rideController.createRide);
router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({min:3}).withMessage('Invalid pickup'),
    query('destination').isString().isLength({min:3}).withMessage('Invalid pickup'),
    rideController.getFare
)

module.exports =router;
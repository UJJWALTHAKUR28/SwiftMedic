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

router.get('/status',
    authMiddleware.authUser,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.getRideStatus
)

router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({min:3}).withMessage('Invalid pickup'),
    query('destination').isString().isLength({min:3}).withMessage('Invalid pickup'),
    rideController.getFare
)
router.post('/confirm',
    authMiddleware.authDriver(),
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
)

router.get('/start-ride',
    authMiddleware.authDriver(),
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({min:6,max:6}).withMessage('Invalid otp'),
    rideController.startRide
)

router.post('/end-ride',
    authMiddleware.authDriver(),
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)
module.exports =router;
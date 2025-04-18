const express = require('express');
const router = express.Router();
const {body} = require('express-validator');
const userController = require('../controllers/user.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
router.post('/register',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address'),
        body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters'),
        body('password').isLength({ min: 12 }).withMessage('Your password must be at least 12 characters long for better security'),
    ],
    userController.registerUser
)

router.post('/login',
[
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 12 }).withMessage('Your password must be at least 12 characters long for better security'),
], userController.loginUser

)

router.get('/profile',authMiddleware.authUser ,userController.getUserProfile
)

router.get('/logout',authMiddleware.authUser ,userController.logoutUser
)
// Routes for user-related operations
module.exports = router;

module.exports = router;
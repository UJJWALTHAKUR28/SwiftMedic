const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const blacklistTokenModel = require('../models/BlacklistToken.model'); // ✅ fixed name
const ambulanceModel = require('../models/ambulancedriver.model');

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const isBlacklisted = await blacklistTokenModel.findOne({ token });
    if (isBlacklisted) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);
        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports.authDriver = (requiredRole = null) => {
    return async (req, res, next) => {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Unauthorized' });

        const isBlacklisted = await blacklistTokenModel.findOne({ token });
        if (isBlacklisted) return res.status(401).json({ message: 'Token is blacklisted' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const driver = await ambulanceModel.findById(decoded._id);
            if (!driver) return res.status(401).json({ message: 'Driver not found' });

            if (requiredRole && driver.role !== requiredRole) {
                return res.status(403).json({ message: 'Forbidden: Insufficient role' });
            }

            req.user = driver;
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
    };
};

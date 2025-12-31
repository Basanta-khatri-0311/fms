const jwt = require('jsonwebtoken');
const User = require('../users/user.model');

const protect = async (req, res, next) => {
    let token;

    try {
        // Geting token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // cookie 
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Verifying token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Checking if user still exists
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists' });
        }

        //Attach user to request
        req.user = user;
        return next();

    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

module.exports = { protect };

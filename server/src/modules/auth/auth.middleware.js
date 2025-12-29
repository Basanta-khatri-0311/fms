const jwt = require('jsonwebtoken')
const User = require('../users/user.model')


const protect = async (req, res, next) => {
    let token;
    // Checking if the token exists in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            //token from header and split Bearer <token> into an array and taking index 1)
            token = req.headers.authorization.split(' ')[1];

            // Verifying the token using our Secret Key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Finding the user from the DB and attach to the request object
            // excluding the password for safety
            req.user = await User.findById(decoded.id).select('-password');

            next()
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
}

module.exports = { protect }
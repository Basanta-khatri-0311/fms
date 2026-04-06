const User = require('../users/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../users/user.service');

exports.register = async (req, res) => {
    try {
        const user = await userService.createUser(req.body, true);
        return res.status(201).json({ message: 'User created successfully', user: { id: user._id, role: user.role } });
    } catch (error) {
        
        return res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(403).json({ message: 'Account locked. Try again later.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await user.save();
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status !== 'ACTIVE') return res.status(403).json({ message: 'Account is inactive' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        user.lastLogin = new Date();
        await user.save();

        return res.status(200).json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role,
                branch: user.branch,
                permissions: user.permissions || {} 
            } 
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
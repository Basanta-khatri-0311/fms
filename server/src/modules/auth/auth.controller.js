const User = require('../users/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { CREATABLE_ROLES_BY_SUPERADMIN } = require('../../constants/roles');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body

        //Basic validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: 'All fields (name, email, password, role) are required'
            });
        }

        // Normalizing email
        const normalizedEmail = email.trim().toLowerCase();

        //Role validation
        if (!CREATABLE_ROLES_BY_SUPERADMIN.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Password strength validation
        const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
        if (!passwordRegex.test(password) || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database with password hashed with salt 10
        const newUser = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        res.status(201).json({ message: "User created successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Finding the user
        // We used .select('+password') because we hid it in the Model earlier
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }



        // Comparing the Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Increase failed login attempts
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

            // Lock the account if attempts exceed 5
            if (user.failedLoginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // applying 15 min lock
                user.failedLoginAttempts = 0; // reseting counter after locking
            }

            await user.save();
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Reseting failed attempts and lock
        user.failedLoginAttempts = 0;
        user.lockUntil = null;

        // Preventing INACTIVE users From Logging In
        if (user.status !== "ACTIVE") {
            return res.status(403).json({ message: "User account is inactive" });
        }

        // Creating the JWT
        const token = jwt.sign(
            { id: user._id, role: user.role }, // Data stored inside the token
            process.env.JWT_SECRET,           // secret key only the server knows
            { expiresIn: '1d' }               // Token expires in 1 day
        );


        // Updating lastLogin
        user.lastLogin = new Date();
        await user.save();


        // Sending back the token and user info
        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


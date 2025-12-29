const User = require('../users/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database with password hashed with salt 10
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
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
        // Finding the user
        // We used .select('+password') because we hid it in the Model earlier
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        // Comparing the Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

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


        // Sending back the token and user info (not the password)
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
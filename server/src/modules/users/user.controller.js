const userService = require('./user.service')
const { USER_ROLES, USER_STATUS } = require('../../constants/roles');


//superadmin creates users
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Required field validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required',
            });
        }

        // Normalizing email
        email = email.trim().toLowerCase();
        name = name.trim();

        // Role validation
        if (role && !Object.values(USER_ROLES).includes(role)) {
            return res.status(400).json({
                message: 'Invalid user role',
            });
        }

        // email already exists
        const existingUser = await userService.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Password strength validation
        const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
        if (!passwordRegex.test(password) || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            });
        }


        const user = await userService.createUser({
            name,
            email,
            password,
            role,
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// List users
exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers({ deletedAt: null })
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Activate / Deactivate user
exports.updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: 'User ID is required',
            });
        }

        if (!Object.values(USER_STATUS).includes(status)) {
            return res.status(400).json({
                message: 'Invalid status value',
            });
        }

        const user = await userService.updateUserStatus(id, status);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
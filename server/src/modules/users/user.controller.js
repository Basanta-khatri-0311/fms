const userService = require('./user.service')


//superadmin creates users
exports.createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// List users
exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers()
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Activate / Deactivate user
exports.updateUserStatus = async (req, res) => {
    try {
        const user = await userService.updateUserStatus(
            req.params.id,
            req.body.status
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
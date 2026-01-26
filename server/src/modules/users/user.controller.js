const userService = require('./user.service');

exports.createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body, false);
        res.status(201).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const result = await userService.getUsers();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        // Fix: Pass req.user._id to prevent self-lockout
        const user = await userService.updateUserStatus(req.params.id, req.body.status, req.user._id);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
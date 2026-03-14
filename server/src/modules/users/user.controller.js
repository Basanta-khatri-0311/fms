const userService = require('./user.service');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');

//create a user
exports.createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body, false);
        res.status(201).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

//get all users
exports.getUsers = catchAsync(async (req, res) => {
    const result = await userService.getUsers();
    res.status(200).json(result);
});

exports.getEmployees = catchAsync(async (req, res) => {
    const result = await userService.getUsers(); 
    // Format lightly for security so sensitive info isn't leaked
    const employees = result.users.map(u => ({
        _id: u._id,
        name: u.name,
        role: u.role
    }));
    res.status(200).json({ users: employees });
});

exports.updateUserStatus = async (req, res) => {
    try {
        // Fix: Pass req.user._id to prevent self-lockout
        const user = await userService.updateUserStatus(req.params.id, req.body.status, req.user._id);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// user data updating
exports.updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
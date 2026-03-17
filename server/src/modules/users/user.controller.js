const userService = require('./user.service');
const AppError = require('../../utils/AppError');
const catchAsync = require('../../utils/catchAsync');

//create a user
exports.createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body, req.user);
        res.status(201).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

//get all users
exports.getUsers = catchAsync(async (req, res) => {
    const filter = {};
    
    // Security: If not Superadmin, can ONLY see students
    if (req.user.role !== 'SUPERADMIN') {
        filter.role = 'STUDENT';
    } else {
        // Superadmin can filter via query parameters
        const { role, excludeRole } = req.query;
        if (role) filter.role = role;
        else if (excludeRole) filter.role = { $ne: excludeRole };
    }

    const result = await userService.getUsers(filter);
    res.status(200).json(result);
});

exports.getEmployees = catchAsync(async (req, res) => {
    // Return all users EXCEPT students for general employee listings
    const result = await userService.getUsers({ role: { $ne: 'STUDENT' } }); 
    
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
        // Fix: Pass req.user to prevent self-lockout and check permissions
        const user = await userService.updateUserStatus(req.params.id, req.body.status, req.user);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

// user data updating
exports.updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body, req.user);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.getStudents = catchAsync(async (req, res) => {
    const result = await userService.getUsersByRole('STUDENT');
    res.status(200).json({ users: result });
});
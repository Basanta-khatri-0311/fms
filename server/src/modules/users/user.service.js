const User = require('./user.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { USER_ROLES, USER_STATUS, CREATABLE_ROLES_BY_SUPERADMIN } = require('../../constants/roles');

// Create user (superadmin only)
exports.createUser = async (data) => {
    let { name, email, password, role } = data;

    // Input validation
    if (!name || !email || !password || !role) {
        const err = new Error('Name, email, password, and role are required');
        err.statusCode = 400;
        throw err;
    }

    // Normalize email & name
    email = email.trim().toLowerCase();
    name = name.trim();

    // Role whitelist check (prevent privilege escalation)
    if (!CREATABLE_ROLES_BY_SUPERADMIN.includes(role)) {
        const err = new Error('Invalid role');
        err.statusCode = 403;
        throw err;
    }

    // Password strength
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/;
    if (!passwordRegex.test(password) || password.length < 8) {
        const err = new Error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
        err.statusCode = 400;
        throw err;
    }

    // Atomic creation using unique index + transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            const err = new Error('User already exists');
            err.statusCode = 409;
            throw err;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create([{
            name,
            email,
            password: hashedPassword,
            role
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return newUser[0];
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Get users with optional filter & pagination
exports.getUsers = async (filter = {}, { page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const users = await User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limit);

    const total = await User.countDocuments(filter);

    return { users, total, page, limit };
};

// Update user status (audit & prevent self-deactivation)
exports.updateUserStatus = async (id, status, performedBy) => {
    if (!Object.values(USER_STATUS).includes(status)) {
        const err = new Error('Invalid status');
        err.statusCode = 400;
        throw err;
    }

    const user = await User.findById(id);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // Prevent self-deactivation
    if (performedBy && performedBy.toString() === user._id.toString()) {
        const err = new Error('Cannot update your own status');
        err.statusCode = 403;
        throw err;
    }

    user.status = status;
    user.lastModifiedBy = performedBy || null; // add audit field
    await user.save();

    return user;
};

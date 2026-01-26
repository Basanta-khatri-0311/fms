const User = require('./user.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { USER_ROLES, CREATABLE_ROLES_BY_SUPERADMIN, USER_STATUS } = require('../../constants/roles');

exports.createUser = async (data, isBootstrap = false) => {
    let { name, email, password, role } = data;

    // Check if a Superadmin already exists for bootstrap logic
    const superAdminExists = await User.exists({ role: USER_ROLES.SUPERADMIN });

    if (!superAdminExists) {
        if (role !== USER_ROLES.SUPERADMIN) {
            const err = new Error('First user must be SUPERADMIN');
            err.statusCode = 400;
            throw err;
        }
    } else if (!isBootstrap && !CREATABLE_ROLES_BY_SUPERADMIN.includes(role)) {
        // Prevent privilege escalation
        const err = new Error('Invalid role assignment');
        err.statusCode = 403;
        throw err;
    }

    // const session = await mongoose.startSession();
    // session.startTransaction();
    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            const err = new Error('User already exists');
            err.statusCode = 409;
            throw err;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create([{
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role
        }], {  });

        // await session.commitTransaction();
        return newUser[0];
    } catch (error) {
        // await session.abortTransaction();
        throw error;
    } finally {
        // session.endSession();
    }
};

exports.getUsers = async (filter = {}, { page = 1, limit = 20 } = {}) => {
    const skip = (page - 1) * limit;
    const users = await User.find(filter).select('-password').skip(skip).limit(limit);
    const total = await User.countDocuments(filter);
    return { users, total, page, limit };
};

exports.updateUserStatus = async (id, status, performedBy) => {
    const user = await User.findById(id);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // Prevent self-deactivation by comparing IDs
    if (performedBy && performedBy.toString() === user._id.toString()) {
        const err = new Error('Cannot update your own status');
        err.statusCode = 403;
        throw err;
    }

    user.status = status;
    await user.save();
    return user;
};
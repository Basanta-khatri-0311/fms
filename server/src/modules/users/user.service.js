const User = require('./user.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const AppError = require('../../utils/AppError');
const { USER_ROLES, CREATABLE_ROLES_BY_SUPERADMIN, CREATABLE_ROLES_BY_STAFF, USER_STATUS } = require('../../constants/roles');

exports.createUser = async (data, creator = null) => {
    let { name, email, password, role } = data;

    // Check if a Superadmin already exists for bootstrap logic
    const superAdminExists = await User.exists({ role: USER_ROLES.SUPERADMIN });

    if (!superAdminExists) {
        if (role !== USER_ROLES.SUPERADMIN) {
            throw new AppError('First user must be SUPERADMIN', 400);
        }
    } else {
        // If creator is Superadmin, check against SUPERADMIN allowlist
        if (creator?.role === USER_ROLES.SUPERADMIN) {
            if (!CREATABLE_ROLES_BY_SUPERADMIN.includes(role)) {
                throw new AppError(`Superadmin cannot create ${role} role`, 403);
            }
        } 
        // If creator is Staff (Approver/Receptionist), check against STAFF allowlist
        else if ([USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST].includes(creator?.role)) {
            if (!CREATABLE_ROLES_BY_STAFF.includes(role)) {
                throw new AppError(`As ${creator.role}, you can only create: ${CREATABLE_ROLES_BY_STAFF.join(', ')}`, 403);
            }
        }
        // Fallback for unauthorized creators
        else if (creator) {
            throw new AppError('You do not have permission to create users', 403);
        }
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new AppError('User already exists', 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create([{
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role,
            ...(data.permissions && { permissions: data.permissions })
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
        throw new AppError('User not found', 404);
    }

    // Prevent self-deactivation 
    if (performedBy._id.toString() === user._id.toString()) {
        throw new AppError('Cannot update your own status', 403);
    }

    // Staff check: Can only update students
    if ([USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST].includes(performedBy.role)) {
        if (user.role !== USER_ROLES.STUDENT) {
            throw new AppError(`As ${performedBy.role}, you can only manage students`, 403);
        }
    }

    user.status = status;
    await user.save();
    return user;
};

//update user data
exports.updateUser = async (id, data, performedBy) => {
    const { name, email, password, role } = data;
    
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Staff check: Can only update students
    if ([USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST].includes(performedBy.role)) {
        if (user.role !== USER_ROLES.STUDENT) {
            throw new AppError(`As ${performedBy.role}, you can only manage students`, 403);
        }
        // Staff cannot change role
        if (role && role !== USER_ROLES.STUDENT) {
            throw new AppError('You cannot change user role', 403);
        }
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (role) user.role = role;
    
    if (data.permissions !== undefined) {
        user.permissions = {
            ...user.permissions,
            ...data.permissions
        };
    }
    
    // Only hash and update password if a new one is provided
    if (password && password.trim().length > 0) {
        user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    return user;
};

exports.getUsersByRole = async (role) => {
    return await User.find({ role }).select('name email totalDue totalAdvance');
};

exports.getUserById = async (id) => {
    const user = await User.findById(id).select('-password');
    if (!user) throw new AppError('User not found', 404);
    return user;
};
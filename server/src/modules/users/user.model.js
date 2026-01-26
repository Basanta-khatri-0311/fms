const mongoose = require('mongoose');
const { USER_ROLES, USER_STATUS } = require('../../constants/roles');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] 
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8,
        validate: {
            validator: function(v) {
                return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(v);
            },
            message: 'Password must include uppercase, lowercase, number, and special character'
        }
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        required: true,
        default: USER_ROLES.STUDENT
    },
    status: {
        type: String,
        enum: Object.values(USER_STATUS),
        default: USER_STATUS.ACTIVE
    },
    lastLogin: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
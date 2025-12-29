const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ["RECEPTIONIST", "APPROVER", "SUPERADMIN", "AUDITOR"],
        required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE"
    },
    lastLogin: { type: Date }
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)

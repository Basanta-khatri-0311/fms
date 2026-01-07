const mongoose = require('mongoose');
const { VENDOR_STATUS } = require('../../constants/vendor')

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  pan: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    immutable: true,
    trim: true,
  },

  contactNumber: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },

  status: {
    type: String,
    enum: Object.values(VENDOR_STATUS),
    default: VENDOR_STATUS.ACTIVE,
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true })


module.exports = mongoose.model('Vendor', vendorSchema);
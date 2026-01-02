const mongoose = require('mongoose');

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
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
},{ timestamps: true })

vendorSchema.index({ pan: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
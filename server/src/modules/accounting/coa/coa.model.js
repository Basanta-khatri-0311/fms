const mongoose = require('mongoose');
const { ACCOUNT_TYPES } = require('../../../constants/accounting')

const coaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(ACCOUNT_TYPES),
      required: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChartOfAccount',
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChartOfAccount', coaSchema);
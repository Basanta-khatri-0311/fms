const mongoose = require('mongoose')
const { ACCOUNTING_STATUS } = require('../../../constants/accounting')

/**
 * make the vender different model because vendors are reused,
 */

const expenseSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },

  billNumber: {
    type: String,
    trim: true,
  },
  billDate: {
    type: Date,
  },
  amountBeforeVAT: {
    type: Number,
    required: true,
    min: 0,
  },
  vatAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  tdsAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  netPayable: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: Object.values(ACCOUNTING_STATUS),
    default: ACCOUNTING_STATUS.PENDING,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true })

expenseSchema.index({ billNumber: 1 });
module.exports = mongoose.model("Expense", expenseSchema)
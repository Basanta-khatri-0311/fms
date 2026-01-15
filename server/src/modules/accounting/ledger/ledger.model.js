const mongoose = require('mongoose');

const ledgerLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
});

const ledgerSchema = new mongoose.Schema(
  {
    entryType: String,

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    debitLines: [ledgerLineSchema],
    creditLines: [ledgerLineSchema],

    narration: String,

    financialYear: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ledger', ledgerSchema);
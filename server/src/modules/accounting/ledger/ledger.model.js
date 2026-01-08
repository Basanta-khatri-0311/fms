const mongoose = require('mongoose')
const { ENTRY_TYPE } = require('../../../constants/accounting')

const ledgerSchema = mongoose.Schema({
    entryType: {
        type: String,
        enum: Object.values(ENTRY_TYPE),
        required: true,
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    debitAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChartOfAccount',
        required: true,
    },
    creditAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChartOfAccount',
        required: true,
    },
    debitAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    creditAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    narration: {
        type: String,
        trim: true,
    },
    financialYear: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true })

ledgerSchema.pre('validate', function (next) {
    if (this.debitAmount !== this.creditAmount) {
        return next(new Error('Ledger validation failed: Debit and Credit must be equal'))
    }
    next()
})


module.exports = mongoose.model('Ledger', ledgerSchema);
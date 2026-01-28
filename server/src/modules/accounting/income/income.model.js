const mongoose = require('mongoose')
const { USER_ROLES } = require('../../../constants/roles');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting')
const { ENTRY_TYPE } = require('../../../constants/accounting')


const incomeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactNumber: String,
    email: String,
    address: String,

    amountBeforeVAT: { type: Number, required: true },
    vatAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tdsAmount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },

    amountReceived: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 }, //For overpayment tracking

    paymentMode: {
        type: String,
        enum: ['CASH', 'BANK', 'CHEQUE'], 
        required: true,
    },

    status: {
        type: String,
        enum: Object.values(ACCOUNTING_STATUS),
        default: ACCOUNTING_STATUS.PENDING,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByRole: { type: String, enum: Object.values(USER_ROLES), required: true },

    approval: {
        status: { type: String, enum: Object.values(ACCOUNTING_STATUS), default: ACCOUNTING_STATUS.PENDING },
        type: { type: String, enum: Object.values(ENTRY_TYPE), default: ENTRY_TYPE.INCOME },
        reason: String,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
    },

    financialYear: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Income", incomeSchema)
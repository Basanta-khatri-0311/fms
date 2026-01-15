const mongoose = require('mongoose')
const { USER_ROLES } = require('../../../constants/roles');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting')
const { ENTRY_TYPE } = require('../../../constants/accounting')

const expenseSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    billNumber: String,
    billDate: Date,

    amountBeforeVAT: { type: Number, required: true },
    vatAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tdsAmount: { type: Number, default: 0 },
    netPayable: { type: Number, required: true },

    paymentMode: {
        type: String,
        enum: ['CASH', 'BANK'],
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
        type: { type: String, enum: Object.values(ENTRY_TYPE), default: ENTRY_TYPE.EXPENSE },
        reason: String,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
    },

    financialYear: { type: String, required: true },
}, { timestamps: true });


expenseSchema.index({ billNumber: 1 });
module.exports = mongoose.model("Expense", expenseSchema)
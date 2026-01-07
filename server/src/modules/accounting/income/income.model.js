const mongoose = require('mongoose')
const { USER_ROLES } = require('../../../constants/roles');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting')
const { ENTRY_TYPE } = require('../../../constants/accounting')


const incomeSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    contactNumber: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    amountBeforeVAT: { type: Number, required: true, min: 0 },
    vatAmount: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    amountReceived: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByRole: { type: String, enum: Object.values(USER_ROLES), required: true },
    approval: {
        status: { type: String, enum: Object.values(ACCOUNTING_STATUS), default: ACCOUNTING_STATUS.PENDING },
        type: { type: String, enum: Object.values(ENTRY_TYPE), required: true },
        reason: { type: String, default: null },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        approvedAt: { type: Date, default: null },
    },
    financialYear: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Income", incomeSchema)
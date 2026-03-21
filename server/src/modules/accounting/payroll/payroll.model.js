const mongoose = require('mongoose');
const { USER_ROLES } = require('../../../constants/roles');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');

const payrollSchema = new mongoose.Schema({
    employeeName: { type: String, required: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeRole: { type: String, enum: Object.values(USER_ROLES) },
    paymentMonth: { type: String, required: true }, // "Mangsir 2080"
    
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    grossSalary: { type: Number, required: true },

    taxDeduction: { type: Number, default: 0 }, // SST/TDS
    providentFund: { type: Number, default: 0 }, // PF
    netPayable: { type: Number, required: true },
    
    amountPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },

    paymentMode: {
        type: String,
        enum: ['CASH', 'BANK', 'CHEQUE'],
        required: true,
    },
    transactionId: { type: String },
    bankName: { type: String },
    attachmentUrl: { type: String },

    status: {
        type: String,
        enum: Object.values(ACCOUNTING_STATUS),
        default: ACCOUNTING_STATUS.PENDING,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByRole: { type: String, enum: Object.values(USER_ROLES), required: true },

    approval: {
        status: { type: String, enum: Object.values(ACCOUNTING_STATUS), default: ACCOUNTING_STATUS.PENDING },
        reason: String,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvedAt: Date,
    },

    financialYear: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Payroll", payrollSchema);

const mongoose = require('mongoose');
const Payroll = require('./payroll.model');
const User = require('../../users/user.model');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');
const SystemSetting = require('../../system/SystemSetting.model');
const { validateAuditControls } = require('../../../utils/auditControls');

const round = (num) => Math.round(num * 100) / 100;

const buildPayrollPayload = async (data, user, existing = null) => {
    // 1. Core Monthly Calculation
    const basicSalary = parseFloat(data.basicSalary) || 0;
    const allowances = parseFloat(data.allowances) || 0;
    const grossSalary = round(basicSalary + allowances);

    const taxDeduction = parseFloat(data.taxDeduction) || 0;
    const providentFund = parseFloat(data.providentFund) || 0;
    const netPayable = round(grossSalary - (taxDeduction + providentFund));

    const amountPaid = parseFloat(data.amountPaid) || 0;

    // 2. Persistent Balance Handling
    let previousDue = 0;
    let previousAdvance = 0;

    if (data.employeeId && mongoose.Types.ObjectId.isValid(data.employeeId)) {
        const employee = await User.findById(data.employeeId);
        if (employee) {
            previousDue = employee.totalDue || 0;
            previousAdvance = employee.totalAdvance || 0;
        }
    }

    // 3. Adjusted Requirement
    // What we owe this month + what we owed before - what we overpaid before
    const adjustedNetPayable = round(netPayable + previousDue - previousAdvance);

    let pendingAmount = 0;
    let advanceAmount = 0;

    if (amountPaid > adjustedNetPayable) {
        advanceAmount = round(amountPaid - adjustedNetPayable);
    } else {
        pendingAmount = round(adjustedNetPayable - amountPaid);
    }

    const base = existing ? existing.toObject() : {};

    return {
        ...base,
        ...data,
        grossSalary,
        netPayable,
        amountPaid,
        pendingAmount,
        advanceAmount,
        previousDue,
        previousAdvance,
        createdBy: base.createdBy || user._id,
        createdByRole: base.createdByRole || user.role,
        financialYear: base.financialYear || (await SystemSetting.findOne()).fiscalYearBS,
    };
};

//create payroll
exports.createPayroll = async (payrollData, user) => {
    const settings = await SystemSetting.findOne();
    // paymentMonth is YYYY-MM if from HTML input, which Date() handles fine
    validateAuditControls(payrollData.paymentMonth || new Date(), user, settings);

    const payload = await buildPayrollPayload(payrollData, user);
    return await Payroll.create(payload);
};

// Check for existing records for employee and month
exports.checkExistingPayroll = async (employeeName, paymentMonth) => {
    return await Payroll.find({ employeeName, paymentMonth });
};

//get payroll
exports.getPayrolls = async (user) => {
    let query = {};
    if (['RECEPTIONIST', 'STUDENT'].includes(user.role)) {
        query.createdBy = user._id;
    }
    
    return await Payroll.find(query)
        .populate('createdBy', 'name')
        .populate('approval.approvedBy', 'name')
        .sort({ createdAt: -1 });
};

//update the payroll
exports.updatePayroll = async (id, updateData, user) => {
    const payroll = await Payroll.findById(id);
    if (!payroll) throw new Error('Payroll entry not found');

    const settings = await SystemSetting.findOne();
    validateAuditControls(payroll.paymentMonth || payroll.createdAt, user, settings);
    if (updateData.paymentMonth) validateAuditControls(updateData.paymentMonth, user, settings);

    if (payroll.approval.status === ACCOUNTING_STATUS.APPROVED) {
        throw new Error('Approved payroll cannot be modified');
    }

    const payload = await buildPayrollPayload(updateData, user, payroll);
    Object.assign(payroll, payroll.toObject(), payload);
    return await payroll.save();
};

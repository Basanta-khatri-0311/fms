const express = require('express')
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');
const { USER_ROLES } = require('../../../constants/roles');
const Expense = require('./expense.model')
exports.createExpense = async (data) => {
    const {
        amountBeforeVAT,
        vatAmount = 0,
        discount = 0,
        tdsAmount = 0,
    } = data

    const netPayable = amountBeforeVAT + vatAmount - discount - tdsAmount

    if (netPayable < 0) throw new Error('Net payable cannot be negative');


    return await Expense.create({
        ...data,
        netPayable,
        status: ACCOUNTING_STATUS.PENDING,
        createdByRole: data.createdByRole,
        financialYear: '2081/82' // TODO: dynamic later
    });
}


exports.getExpenses = async (user) => {
    if (user.role === USER_ROLES.RECEPTIONIST) {
        return Expense.find({ createdBy: user._id }).sort({ createdAt: -1 });
    }
    return Expense.find().sort({ createdAt: -1 }); // Approver / Superadmin
};

exports.updateExpenseStatus = async (expenseId, status, approver) => {
    
    const expense = await Expense.findById(expenseId);

    if (!expense) throw new Error('Expense entry not found');

    if (![ACCOUNTING_STATUS.APPROVED, ACCOUNTING_STATUS.PENDING].includes(status)) {
        throw new Error('Invalid status. Must be APPROVED or REJECTED');
    }

    if (expense.status !== 'PENDING') {
        throw new Error(`Cannot update. Expense is already ${expense.status}`);
    }

    expense.status = status;
    expense.approvedBy = approver._id;
    expense.approvedAt = new Date();

    await expense.save();

    // TODO: Ledger posting only if APPROVED
    return expense;
};
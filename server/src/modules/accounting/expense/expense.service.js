const express = require('express')
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');

exports.createExpense = async (data) => {
    const {
        amountBeforeVAT,
        vatAmount = 0,
        discount = 0,
        tdsAmount = 0,
    } = data

    const netPayable = amountBeforeVAT + vatAmount - discount - tdsAmount

    if (netPayable < 0) {
        throw new Error('Net payable cannot be negative');
    }
    return await Expense.create({
        ...data,
        netPayable,
        status: ACCOUNTING_STATUS.PENDING,
    });
}


exports.getAllExpenses = async () => {
  return await Expense.find().sort({ createdAt: -1 });
};
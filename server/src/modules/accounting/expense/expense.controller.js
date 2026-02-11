const expenseService = require('./expense.service')
const Vendor = require('../../vendors/vendor.model')
const postingService = require('../posting.service');
const { getCurrentFinancialYear } = require('../../../utils/dateUtils');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../../constants/accounting');

exports.createExpense = async (req, res) => {
    try {
        const { vendorName, amountBeforeVAT } = req.body;

        const vendor = await Vendor.findOne({ name: vendorName });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const expenseData = {
            ...req.body,
            vendor: vendor._id,
            vendorPan: vendor.panNumber, 
            attachmentUrl: req.file ? req.file.path : null,
        };

        const expense = await expenseService.createExpense(expenseData, req.user);
        return res.status(201).json(expense);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getExpenses(req.user);
        return res.status(200).json(expenses);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expenseData = {
      ...req.body,
      attachmentUrl: req.file ? req.file.path : undefined,
    };

    const updated = await expenseService.updateExpense(id, expenseData, req.user);

    return res.status(200).json({
      message: 'Expense entry updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 1. Update the Expense record status
        const expense = await expenseService.updateExpenseStatus(id, status, req.user);

        //Only if status is APPROVED, post to Ledger
        if (status === ACCOUNTING_STATUS.APPROVED) {
            await postingService.postToLedger({
                entry: expense,
                entryType: ENTRY_TYPE.EXPENSE, 
                approvedBy: req.user._id
            });
        }

        return res.status(200).json({ 
            message: `Expense status updated and posted to ledger`, 
            data: expense 
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
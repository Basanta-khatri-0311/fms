const expenseService = require('./expense.service')
const Vendor = require('../../vendors/vendor.model')
const postingService = require('../posting.service');
const { getCurrentFinancialYear } = require('../../../utils/dateUtils');


exports.createExpense = async (req, res) => {
    try {
        const { vendorName, amountBeforeVAT } = req.body;

        if (!vendorName || !amountBeforeVAT) {
            return res.status(400).json({
                message: 'Vendor name and amountBeforeVAT are required',
            });
        }

        const vendor = await Vendor.findOne({ name: vendorName });
        if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

        const expense = await expenseService.createExpense({
            ...req.body,
            vendor: vendor._id,
            createdBy: req.user._id,
            createdByRole: req.user.role,
            financialYear: getCurrentFinancialYear()
        });

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

exports.updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 1. Update the Expense record status
        const expense = await expenseService.updateExpenseStatus(id, status, req.user);

        //Only if status is APPROVED, post to Ledger
        if (status === 'APPROVED') {
            await postingService.postToLedger({
                entry: expense,
                entryType: 'EXPENSE', 
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
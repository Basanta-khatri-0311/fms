const expenseService = require('./expense.service')
const Vendor = require('../../vendors/vendor.model')


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
            financialYear: '2081/82' //dynamic later: todo
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

        const expense = await expenseService.updateExpenseStatus(id, status, req.user);
        return res.status(200).json({ message: `Expense ${status.toLowerCase()}`, data: expense });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
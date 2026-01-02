const expenseService = require('./expense.service')


exports.createExpense = async (req, res) => {
    try {
        const { vendorName, amountBeforeVAT } = req.body;

        if (!vendorName || !amountBeforeVAT) {
            return res.status(400).json({
                message: 'Vendor name and amountBeforeVAT are required',
            });
        }

        const expense = await expenseService.createExpense({
            ...req.body,
            createdBy: req.user._id,
        });

        return res.status(201).json(expense);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getAllExpenses();
        return res.status(200).json(expenses);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
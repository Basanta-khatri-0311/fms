const incomeService = require('./income.service')


exports.createIncome = async (req, res) => {
    try {
        if (!req.body.name || !req.body.amountBeforeVAT) {
            return res.status(400).json({
                message: 'Name and amountBeforeVAT are required',
            });
        }
        const income = await incomeService.createIncome(
            req.body,
            req.user
        );

        return res.status(201).json({
            message: 'Income entry created and sent for approval',
            data: income,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.getIncomes = async (req, res) => {
    try {
        const incomes = await incomeService.getIncomes(req.user);

        return res.status(200).json({
            data: incomes,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};


exports.approveIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        const income = await incomeService.updateIncomeStatus(id, status, req.user);

        // TODO: triggering ledger posting & audit log

        return res.status(200).json({ message: 'Income status updated', data: income });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
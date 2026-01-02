const incomeService = require('./income.service')


exports.createIncome = async (req, res) => {
    try {
        const {
            name,
            contactNumber,
            email,
            address,
            amountBeforeVAT,
            vat,
            discount,
            amountReceived,
        } = req.body;

        if (!name || !amountBeforeVAT) {
            return res.status(400).json({
                message: 'Name and amountBeforeVAT are required',
            });
        }
        const income = await incomeService.createIncome({
            ...req.body,
            createdBy: req.user._id,
        });

        return res.status(201).json(income);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.getAllIncomes = async (req, res) => {
    try {
        const incomes = await incomeService.getAllIncomes()
        res.status(200).json(incomes);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
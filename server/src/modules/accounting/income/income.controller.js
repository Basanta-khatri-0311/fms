const incomeService = require('./income.service')
const postingService = require('../posting.service');

exports.createIncome = async (req, res) => {
    try {
        if (!req.body.name || !req.body.amountBeforeVAT) {
            return res.status(400).json({
                message: 'Name and amountBeforeVAT are required',
            });
        }

        const incomeData = {
            ...req.body,
            attachmentUrl: req.file ? req.file.path : null, 
        };
        const income = await incomeService.createIncome(
            incomeData,
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

        //Update the Income record status
        const income = await incomeService.updateIncomeStatus(id, status, req.user);

        //Only if status is APPROVED, post to Ledger
        if (status === 'APPROVED') {
            await postingService.postToLedger({
                entry: income,
                entryType: 'INCOME',
                approvedBy: req.user._id
            });
        }
        return res.status(200).json(income);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
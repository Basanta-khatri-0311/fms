const incomeService = require('./income.service')
const postingService = require('../posting.service');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../../constants/accounting');

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


exports.updateIncomeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        //Update the Income record status
        const income = await incomeService.updateIncomeStatus(id, status, req.user);

        const isApproved = status === 'APPROVED' || status === ACCOUNTING_STATUS.APPROVED;

        if (isApproved) {
            
            await postingService.postToLedger({
                entry: income,
                entryType: ENTRY_TYPE.INCOME,
                approvedBy: req.user._id
            });
        }
        return res.status(200).json({
            message: `Income status updated to ${status}`,
            data: income
        });
    } catch (error) {
        console.error("Income Approval Error:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Edit income details before approval
exports.updateIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const incomeData = {
            ...req.body,
            attachmentUrl: req.file ? req.file.path : undefined,
        };

        const updated = await incomeService.updateIncome(id, incomeData, req.user);

        return res.status(200).json({
            message: 'Income entry updated successfully',
            data: updated,
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};
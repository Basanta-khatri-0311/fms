const incomeService = require('./income.service')
const postingService = require('../posting.service');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../../constants/accounting');

const AppError = require('../../../utils/AppError');
const catchAsync = require('../../../utils/catchAsync');

exports.createIncome = catchAsync(async (req, res, next) => {
    if (!req.body.name || !req.body.amountBeforeVAT) {
        return next(new AppError('Name and amountBeforeVAT are required', 400));
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
});

exports.getIncomes = catchAsync(async (req, res, next) => {
    const incomes = await incomeService.getIncomes(req.user);

    return res.status(200).json({
        data: incomes,
    });
});

// Edit income details before approval
exports.updateIncome = catchAsync(async (req, res, next) => {
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
});
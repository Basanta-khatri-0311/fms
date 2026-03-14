const expenseService = require('./expense.service')
const Vendor = require('../../vendors/vendor.model')
const postingService = require('../posting.service');
const { getCurrentFinancialYear } = require('../../../utils/dateUtils');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../../constants/accounting');

const AppError = require('../../../utils/AppError');
const catchAsync = require('../../../utils/catchAsync');

//create expense
exports.createExpense = catchAsync(async (req, res, next) => {
    const { vendorName, amountBeforeVAT } = req.body;

    const vendor = await Vendor.findOne({ name: vendorName });
    if (!vendor) return next(new AppError('Vendor not found', 404));

    const expenseData = {
        ...req.body,
        vendor: vendor._id,
        vendorPan: vendor.panNumber, 
        attachmentUrl: req.file ? req.file.path : null,
    };

    const expense = await expenseService.createExpense(expenseData, req.user);
    return res.status(201).json(expense);
});
//get all expenses
exports.getExpenses = catchAsync(async (req, res, next) => {
    const expenses = await expenseService.getExpenses(req.user);
    return res.status(200).json(expenses);
});
//update expenses
exports.updateExpense = catchAsync(async (req, res, next) => {
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
});

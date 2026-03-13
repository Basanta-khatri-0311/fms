const payrollService = require('./payroll.service');

const AppError = require('../../../utils/AppError');
const catchAsync = require('../../../utils/catchAsync');

exports.createPayroll = catchAsync(async (req, res, next) => {
    const { employeeName, paymentMonth, basicSalary, paymentMode } = req.body;

    if (!employeeName || !paymentMonth || !basicSalary || !paymentMode) {
        return next(new AppError('Missing required payroll fields', 400));
    }

    const payrollData = {
        ...req.body,
        attachmentUrl: req.file ? req.file.path : null,
    };

    const payroll = await payrollService.createPayroll(payrollData, req.user);
    return res.status(201).json(payroll);
});

exports.getPayrolls = catchAsync(async (req, res, next) => {
    const payrolls = await payrollService.getPayrolls(req.user);
    return res.status(200).json(payrolls);
});

exports.updatePayroll = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const payrollData = {
        ...req.body,
    };
    if (req.file) {
         payrollData.attachmentUrl = req.file.path;
    }

    const payroll = await payrollService.updatePayroll(id, payrollData, req.user);
    return res.status(200).json(payroll);
});

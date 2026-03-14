const Payroll = require('./payroll.model');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');
const { getCurrentFinancialYear } = require('../../../utils/dateUtils');

//create payroll
exports.createPayroll = async (payrollData, user) => {
    const grossSalary = Number(payrollData.basicSalary) + Number(payrollData.allowances || 0);
    const deductions = Number(payrollData.taxDeduction || 0) + Number(payrollData.providentFund || 0);
    const netPayable = grossSalary - deductions;

    const amountPaid = Number(payrollData.amountPaid || 0);
    const pendingAmount = netPayable - amountPaid;

    if (amountPaid > netPayable) {
        throw new Error('Amount paid cannot exceed net payable for payroll');
    }

    const payload = {
        ...payrollData,
        grossSalary,
        netPayable,
        amountPaid,
        pendingAmount,
        createdBy: user._id,
        createdByRole: user.role,
        financialYear: getCurrentFinancialYear(),
    };

    return await Payroll.create(payload);
};

//get payroll
exports.getPayrolls = async (user) => {
    // Receptionist/other basic roles can only see own payroll entries
    if (['RECEPTIONIST', 'STUDENT'].includes(user.role)) {
        return await Payroll.find({ createdBy: user._id })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
    }
    // Approver/Superadmin sees all
    return await Payroll.find()
        .populate('createdBy', 'name')
        .populate('approval.approvedBy', 'name')
        .sort({ createdAt: -1 });
};

//update the payroll
exports.updatePayroll = async (id, updateData, user) => {
    const payroll = await Payroll.findById(id);

    if (!payroll) {
        throw new Error('Payroll entry not found');
    }

    if (payroll.approval.status === ACCOUNTING_STATUS.APPROVED) {
        throw new Error('Approved payroll cannot be modified');
    }

    // Only creator or admin/approver can update
    if (payroll.createdBy.toString() !== user._id.toString() && !['SUPERADMIN', 'APPROVER'].includes(user.role)) {
        throw new Error('Not authorized to update this payroll');
    }

    const basicSalary = updateData.basicSalary !== undefined ? Number(updateData.basicSalary) : payroll.basicSalary;
    const allowances = updateData.allowances !== undefined ? Number(updateData.allowances) : payroll.allowances;
    
    const grossSalary = basicSalary + allowances;

    const taxDeduction = updateData.taxDeduction !== undefined ? Number(updateData.taxDeduction) : payroll.taxDeduction;
    const providentFund = updateData.providentFund !== undefined ? Number(updateData.providentFund) : payroll.providentFund;
    
    const deductions = taxDeduction + providentFund;
    
    const netPayable = grossSalary - deductions;

    const amountPaid = updateData.amountPaid !== undefined ? Number(updateData.amountPaid) : payroll.amountPaid;
    const pendingAmount = netPayable - amountPaid;

    if (amountPaid > netPayable) {
        throw new Error('Amount paid cannot exceed net payable for payroll');
    }

    const payload = {
        ...updateData,
        grossSalary,
        netPayable,
        amountPaid,
        pendingAmount,
    };

    return await Payroll.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

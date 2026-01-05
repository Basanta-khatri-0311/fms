const Income = require('./income.model');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');
const { USER_ROLES } = require('../../../constants/roles')


exports.createIncome = async (data, user) => {
  const {
    name,
    contactNumber,
    email,
    address,
    amountBeforeVAT,
    vatAmount = 0,
    discount = 0,
  } = data;

  // --------- VALIDATION ----------
  if (!amountBeforeVAT || amountBeforeVAT <= 0) {
    throw new Error('Amount before VAT must be greater than zero');
  }

  if (vatAmount < 0) throw new Error('VAT amount cannot be negative');
  if (discount < 0) throw new Error('Discount cannot be negative');
  if (discount > amountBeforeVAT) throw new Error('Discount cannot exceed amount before VAT');

  const netAmount = amountBeforeVAT + vatAmount - discount;
  const pendingAmount = netAmount;

  const income = await Income.create({
    name,
    contactNumber,
    email,
    address,
    amountBeforeVAT,
    vatAmount,
    discount,
    netAmount,
    pendingAmount,
    status: ACCOUNTING_STATUS.PENDING,
    createdBy: user._id,
    createdByRole: user.role,
    financialYear: '2081/82',
  });


  return income
};

exports.getIncomes = async (user) => {

  if (user.role === USER_ROLES.RECEPTIONIST) {
    return Income.find({ createdBy: user._id }).sort({ createdAt: -1 });
  }

  // Approver / Superadmin
  return Income.find().sort({ createdAt: -1 });
};


exports.getIncomeById = async (id) => {
    return Income.findById(id);
};


exports.updateIncomeStatus = async (incomeId, status, approver) => {
    const income = await Income.findById(incomeId);
    if (!income) throw new Error('Income entry not found');

    //  Only allow APPROVED or REJECTED
    if (![ACCOUNTING_STATUS.APPROVED, ACCOUNTING_STATUS.REJECTED].includes(status)) {
        throw new Error('Invalid status. Must be APPROVED or REJECTED');
    }

     // Cannot approve/reject again if already done
    if (income.status !== ACCOUNTING_STATUS.PENDING) {
        throw new Error(`Cannot update. Income is already ${income.status}`);
    }

    income.status = status;
    income.approvedBy = approver._id;
    income.approvedAt = new Date();

    await income.save();
    return income;
};
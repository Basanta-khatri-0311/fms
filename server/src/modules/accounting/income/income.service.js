const Income = require('./income.model');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../../constants/accounting');
const { USER_ROLES } = require('../../../constants/roles');

/**
 * Create a new income entry
 */
exports.createIncome = async (data, user) => {
  const { name, contactNumber, email, address, amountBeforeVAT, vatAmount = 0, discount = 0, tdsAmount = 0  } = data;

  if (!amountBeforeVAT || amountBeforeVAT <= 0) throw new Error('Amount before VAT must be greater than zero');
  if (vatAmount < 0) throw new Error('VAT amount cannot be negative');
  if (discount < 0) throw new Error('Discount cannot be negative');
  if (discount > amountBeforeVAT) throw new Error('Discount cannot exceed amount before VAT');

  const netAmount = amountBeforeVAT + vatAmount - discount - tdsAmount;

  return await Income.create({
    ...data,
    netAmount,
    pendingAmount: netAmount,
    createdBy: user._id,
    createdByRole: user.role,
    approval: {
      status: ACCOUNTING_STATUS.PENDING,
      type: ENTRY_TYPE.INCOME,
      reason: null,
      approvedBy: null,
      approvedAt: null
    },
    financialYear: '2081/82', // TODO: dynamic
  });
}

/**
 * Get incomes based on user role
 */
exports.getIncomes = async (user) => {
  if (user.role === USER_ROLES.RECEPTIONIST) {
    return Income.find({ createdBy: user._id }).sort({ createdAt: -1 });
  }
  // Approver / Superadmin
  return Income.find().sort({ createdAt: -1 });
};

/**
 * Get income by ID
 */
exports.getIncomeById = async (id) => {
  return Income.findById(id);
};

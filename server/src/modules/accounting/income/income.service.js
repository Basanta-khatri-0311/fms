const Income = require('./income.model');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../../constants/accounting');
const { USER_ROLES } = require('../../../constants/roles');
const { getCurrentFinancialYear } = require('../../../utils/dateUtils');
/**
 * Create a new income entry
 */
exports.createIncome = async (data, user) => {
  const {
    amountBeforeVAT,
    vatAmount = 0,
    discount = 0,
    tdsAmount = 0,
    amountReceived = 0
  } = data;

  if (!amountBeforeVAT || amountBeforeVAT <= 0) throw new Error('Amount before VAT must be greater than zero');
  if (vatAmount < 0) throw new Error('VAT amount cannot be negative');
  if (discount < 0) throw new Error('Discount cannot be negative');
  if (discount > amountBeforeVAT) throw new Error('Discount cannot exceed amount before VAT');

  const netAmount = amountBeforeVAT + vatAmount - discount - tdsAmount;

  // To Handle Overpayment/Advance Logic
  let pendingAmount = 0;
  let excessAmount = 0;

  if (amountReceived > netAmount) {
    pendingAmount = 0;
    excessAmount = amountReceived - netAmount; // This is the "Advance"
  } else {
    pendingAmount = netAmount - amountReceived;
    excessAmount = 0;
  }

  return await Income.create({
    ...data,
    netAmount,
    amountReceived,
    pendingAmount,
    // We store the excess in a temporary field so the Ledger Posting service knows it's an advance
    advanceAmount: excessAmount,
    createdBy: user._id,
    createdByRole: user.role,
    approval: {
      status: ACCOUNTING_STATUS.PENDING,
      type: ENTRY_TYPE.INCOME,
    },
    financialYear: getCurrentFinancialYear(),
  });
};

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


exports.updateIncomeStatus = async (id, status, user) => {
  const income = await Income.findById(id);
  if (!income) {
    throw new Error('Income record not found');
  }

  // Update the main status
  income.status = status;

  // Update the approval sub-document
  income.approval.status = status;
  income.approval.approvedBy = user._id;
  income.approval.approvedAt = new Date();

  return await income.save();
};
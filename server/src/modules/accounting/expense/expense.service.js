const Expense = require('./expense.model');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../../constants/accounting');

/**
 * Create a new expense entry
 */
exports.createExpense = async (data) => {
  const { amountBeforeVAT, vatAmount = 0, discount = 0, tdsAmount = 0 } = data;

  const netPayable = amountBeforeVAT + vatAmount - discount - tdsAmount;
  if (netPayable < 0) throw new Error('Net payable cannot be negative');

  const expense = await Expense.create({
    ...data,
    netPayable,
    status: ACCOUNTING_STATUS.PENDING,
    financialYear: '2081/82',
    approval: {
      type: ENTRY_TYPE.EXPENSE,   // required field
      status: ACCOUNTING_STATUS.PENDING,
      reason: null,
      approvedBy: null,
      approvedAt: null
    }
  });
  return expense
};

/**
 * Get expenses based on user role
 */
exports.getExpenses = async (user) => {
  if (user.role === 'RECEPTIONIST') {
    return Expense.find({ createdBy: user._id }).sort({ createdAt: -1 });
  }
  // Approver / Superadmin
  return Expense.find().sort({ createdAt: -1 });
};

/**
 * Get expense by ID
 */
exports.getExpenseById = async (id) => {
  return Expense.findById(id);
};

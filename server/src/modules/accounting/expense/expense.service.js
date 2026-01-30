const Expense = require('./expense.model');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../../constants/accounting');
const { getCurrentFinancialYear } = require('../../../utils/dateUtils');

/**
 * Create a new expense entry with payment tracking
 */
exports.createExpense = async (data) => {
  const { 
    amountBeforeVAT, 
    vatAmount = 0, 
    discount = 0, 
    tdsAmount = 0,
    amountPaid = 0 // NEW: Track actual payment
  } = data;

  // Calculate net payable (total bill amount)
  const netPayable = amountBeforeVAT + vatAmount - discount - tdsAmount;
  if (netPayable < 0) throw new Error('Net payable cannot be negative');

  // Calculate pending or advance (same logic as income)
  let pendingAmount = 0;
  let advanceAmount = 0;

  if (amountPaid > netPayable) {
    // Overpayment - we paid vendor more than the bill
    pendingAmount = 0;
    advanceAmount = amountPaid - netPayable;
  } else {
    // Underpayment - we still owe vendor
    pendingAmount = netPayable - amountPaid;
    advanceAmount = 0;
  }

  const expense = await Expense.create({
    ...data,
    netPayable,
    amountPaid,      // NEW
    pendingAmount,   // NEW
    advanceAmount,   // NEW
    status: ACCOUNTING_STATUS.PENDING,
    financialYear: getCurrentFinancialYear(),
    approval: {
      type: ENTRY_TYPE.EXPENSE,
      status: ACCOUNTING_STATUS.PENDING,
      reason: null,
      approvedBy: null,
      approvedAt: null
    }
  });
  
  return expense;
};

/**
 * Get expenses based on user role
 */
exports.getExpenses = async (user) => {
  let query = {};
  
  if (user.role === 'RECEPTIONIST') {
    query = { createdBy: user._id };
  }
  
  return await Expense.find(query)
    .populate('vendor', 'name email contactNumber') // Populate more vendor details
    .sort({ createdAt: -1 });
};

/**
 * Get expense by ID
 */
exports.getExpenseById = async (id) => {
  return Expense.findById(id).populate('vendor');
};

/**
 * Update expense status (approve/reject)
 */
exports.updateExpenseStatus = async (id, status, user) => {
    const expense = await Expense.findById(id).populate('vendor');
    if (!expense) throw new Error('Expense not found');

    expense.status = status;
    expense.approval.status = status;
    expense.approval.approvedBy = user._id;
    expense.approval.approvedAt = new Date();

    return await expense.save();
};
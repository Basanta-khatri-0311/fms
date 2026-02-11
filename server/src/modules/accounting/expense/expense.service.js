const Expense = require('./expense.model');
const { USER_ROLES } = require('../../../constants/roles');
const { getCurrentFinancialYear } = require('../../../utils/dateUtils');

const buildExpensePayload = (data, user, existing = null) => {
  // conversion to Numbers
  const amountBeforeVAT = parseFloat(data.amountBeforeVAT) || 0;
  const amountPaid = parseFloat(data.amountPaid) || 0;
  const discountAmount = parseFloat(data.discount) || 0;
  const vatRate = parseFloat(data.vatRate) || 13;
  const tdsRate = parseFloat(data.tdsRate) || 0;

  const round = (num) => Math.round(num * 100) / 100;

  // Calculation Logic
  const taxableAmount = amountBeforeVAT - discountAmount;
  const calculatedVat = round(taxableAmount * (vatRate / 100));
  const totalBillAmount = round(taxableAmount + calculatedVat); // Total amount on vendor's bill
  const calculatedTds = round(taxableAmount * (tdsRate / 100)); // TDS we withhold

  // Net Payable is what we actually owe the vendor (Bill - TDS)
  const netPayable = round(totalBillAmount - calculatedTds);

  let pendingAmount = 0;
  let advanceAmount = 0;

  if (amountPaid > netPayable) {
    advanceAmount = round(amountPaid - netPayable);
  } else {
    pendingAmount = round(netPayable - amountPaid);
  }

  const base = existing ? existing.toObject() : {};

  return {
    ...base,
    ...data,
    amountBeforeVAT,
    vatAmount: calculatedVat,
    tdsAmount: calculatedTds,
    netPayable: totalBillAmount, // The full bill value
    amountPaid,
    pendingAmount,
    advanceAmount,
    createdBy: base.createdBy || user._id,
    createdByRole: base.createdByRole || user.role,
    financialYear: base.financialYear || getCurrentFinancialYear(),
  };
};

/**
 * Create a new expense entry with payment tracking
 */
exports.createExpense = async (data, user) => {
  const payload = buildExpensePayload(data, user);
  return await Expense.create(payload);
};

/**
 * Get expenses based on user role
 */
exports.getExpenses = async (user) => {
  let query = {};
  
  if (user.role === USER_ROLES.RECEPTIONIST) {
    query = { createdBy: user._id };
  }
  
  return await Expense.find(query)
    .populate('vendor', 'name email contactNumber')
    .populate('createdBy', 'name')          
    .populate('approval.approvedBy', 'name') 
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

// Update expense when still pending (Approver / Superadmin)
exports.updateExpense = async (id, data, user) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new Error('Expense not found');

  if (expense.status !== 'PENDING') {
    throw new Error('Only PENDING expenses can be edited');
  }

  const payload = buildExpensePayload(data, user, expense);
  Object.assign(expense, payload);
  return await expense.save();
};
const Expense = require('./expense.model');
const { USER_ROLES } = require('../../../constants/roles');
const SystemSetting = require('../../system/SystemSetting.model');
const { validateAuditControls } = require('../../../utils/auditControls');

const buildExpensePayload = async (data, user, existing = null) => {
  // conversion to Numbers
  const amountBeforeVAT = parseFloat(data.amountBeforeVAT) || 0;
  const amountPaid = parseFloat(data.amountPaid) || 0;
  const previousDue = parseFloat(data.previousDue) || 0;
  const previousAdvance = parseFloat(data.previousAdvance) || 0;
  const discountRate = parseFloat(data.discountRate) || 0;
  const discountAmount = parseFloat(data.discount) || 0;
  const vatRate = data.vatRate !== undefined ? parseFloat(data.vatRate) : 13;
  const tdsRate = data.tdsRate !== undefined ? parseFloat(data.tdsRate) : 0;

  const round = (num) => Math.round(num * 100) / 100;

  // Calculation Logic
  const taxableAmount = amountBeforeVAT - discountAmount;
  const calculatedVat = round(taxableAmount * (vatRate / 100));
  const totalBillAmount = round(taxableAmount + calculatedVat); // Total amount on vendor's bill
  const calculatedTds = round(taxableAmount * (tdsRate / 100)); // TDS we withhold

  // Net Payable is what we actually owe the vendor for this bill (Taxable + VAT - TDS withholding)
  const currentNetBalance = round(totalBillAmount - calculatedTds);

  // Adjusted Net incorporates previous due/advance
  const totalRequired = round(currentNetBalance + previousDue - previousAdvance);

  let pendingAmount = 0;
  let advanceAmount = 0;

  if (amountPaid > totalRequired) {
    advanceAmount = round(amountPaid - totalRequired);
  } else {
    pendingAmount = round(totalRequired - amountPaid);
  }

  const base = existing ? existing.toObject() : {};

  return {
    ...base,
    ...data,
    amountBeforeVAT,
    vatRate,
    vatAmount: calculatedVat,
    discountRate,
    discount: discountAmount,
    tdsRate,
    tdsAmount: calculatedTds,
    netPayable: currentNetBalance, // The actual amount owed to the vendor after TDS deduction
    amountPaid,
    previousDue,
    previousAdvance,
    pendingAmount,
    advanceAmount,
    createdBy: base.createdBy || user._id,
    createdByRole: base.createdByRole || user.role,
    financialYear: base.financialYear || (await SystemSetting.findOne()).fiscalYearBS,
  };
};



/**
 * Create a new expense entry with payment tracking
 */
exports.createExpense = async (data, user) => {
  const settings = await SystemSetting.findOne();
  validateAuditControls(data.billDate || new Date(), user, settings);

  const payload = await buildExpensePayload(data, user);
  return await Expense.create(payload);
};

/**
 * Get expenses based on user role
 */
exports.getExpenses = async (user) => {
  let query = {};
  
  if (user.role === USER_ROLES.RECEPTIONIST) {
    query.$or = [
      { branch: user.branch },
      { createdBy: user._id }
    ];
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

const { generateBillNumber } = require('../../../utils/generateInvoice');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');

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

    if (status === ACCOUNTING_STATUS.APPROVED && !expense.billNumber) {
        expense.billNumber = await generateBillNumber(expense.branch, expense.financialYear);
    }

    return await expense.save();
};

// Update expense when still pending (Approver / Superadmin)
exports.updateExpense = async (id, data, user) => {
  const expense = await Expense.findById(id);
  if (!expense) throw new Error('Expense not found');

  const settings = await SystemSetting.findOne();
  // Check both existing and new date (if provided)
  validateAuditControls(expense.billDate || expense.createdAt, user, settings);
  if (data.billDate) validateAuditControls(data.billDate, user, settings);

  if (expense.status !== 'PENDING') {
    throw new Error('Only PENDING expenses can be edited');
  }

  const payload = await buildExpensePayload(data, user, expense);
  Object.assign(expense, payload);
  return await expense.save();
};
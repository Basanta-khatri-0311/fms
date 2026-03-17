const Income = require('./income.model');
const User = require('../../users/user.model');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');
const { getCurrentFinancialYear } = require('../../../utils/dateUtils');
const { generateInvoiceNumber } = require('../../../utils/generateInvoice');

const buildIncomePayload = async (data, user, existing = null) => {
  // Explicitly parsed to prevent "12000" + 135 = "12000135"
  const amountBeforeVAT = parseFloat(data.amountBeforeVAT) || 0;
  const amountReceived = parseFloat(data.amountReceived) || 0;
  const discountAmount = parseFloat(data.discount) || 0;
  const vatRate = parseFloat(data.vatRate) || 13;
  const tdsRate = parseFloat(data.tdsRate) || 0;

  const round = (num) => Math.round(num * 100) / 100;

  const taxableAmount = amountBeforeVAT - discountAmount;
  const calculatedVat = round(taxableAmount * (vatRate / 100));
  const totalInvoiceValue = round(taxableAmount + calculatedVat);
  const calculatedTds = round(taxableAmount * (tdsRate / 100));

  // client owes the Net Amount (Total minus TDS withheld)
  const netReceivable = round(totalInvoiceValue - calculatedTds);

  let previousDue = 0;
  let previousAdvance = 0;

  // If studentId is provided, fetch their current approved balance
  if (data.studentId) {
    const student = await User.findById(data.studentId);
    if (student) {
      previousDue = student.totalDue || 0;
      previousAdvance = student.totalAdvance || 0;
    }
  }

  // Final amount to pay = Current Net + Previous Due - Previous Advance
  const adjustedNetReceivable = round(netReceivable + previousDue - previousAdvance);

  let pendingAmount = 0;
  let excessAmount = 0;

  if (amountReceived > adjustedNetReceivable) {
    excessAmount = round(amountReceived - adjustedNetReceivable);
  } else {
    pendingAmount = round(adjustedNetReceivable - amountReceived);
  }

  const base = existing ? existing.toObject() : {};

  return {
    ...base,
    ...data,
    amountBeforeVAT,
    vatAmount: calculatedVat,
    discount: discountAmount,
    tdsAmount: calculatedTds,
    netAmount: totalInvoiceValue,
    amountReceived,
    pendingAmount,
    advanceAmount: excessAmount,
    previousDue,
    previousAdvance,
    createdBy: base.createdBy || user._id,
    createdByRole: base.createdByRole || user.role,
    financialYear: base.financialYear || getCurrentFinancialYear(),
  };
};
//create income
exports.createIncome = async (data, user) => {
  const payload = await buildIncomePayload(data, user);
  return await Income.create(payload);
};

//update status of income (approve/reject)
exports.updateIncomeStatus = async (id, status, user) => {
  const income = await Income.findById(id);
  if (!income) throw new Error('Income record not found');

  income.status = status;
  income.approval.status = status;
  income.approval.approvedBy = user._id;
  income.approval.approvedAt = new Date();

  // Trigger your utility only when status becomes APPROVED
  if (status === ACCOUNTING_STATUS.APPROVED && !income.invoiceNumber) {
    income.invoiceNumber = await generateInvoiceNumber(income.branch, income.financialYear);
    income.isApproved = true;
  }

  return await income.save();
};

// Update income when still pending (Approver / Superadmin)
exports.updateIncome = async (id, data, user) => {
  const income = await Income.findById(id);
  if (!income) throw new Error('Income record not found');

  if (income.status !== ACCOUNTING_STATUS.PENDING) {
    throw new Error('Only PENDING incomes can be edited');
  }

  const payload = await buildIncomePayload(
    data,
    user,
    income
  );

  Object.assign(income, payload);
  return await income.save();
};

//get all incomes
exports.getIncomes = async (user) => {
  let query = {};
  if (user.role === 'RECEPTIONIST') query = { createdBy: user._id };
  return await Income.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });
};
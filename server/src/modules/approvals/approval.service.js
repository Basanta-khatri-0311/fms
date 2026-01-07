const Income = require('../accounting/income/income.model')
const Expense = require('../accounting/expense/expense.model')

const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../constants/accounting')

/**
 * Process an approval action (APPROVE / REJECT)
 * type: INCOME or EXPENSE
 * action: APPROVED / REJECTED
 * rejectionReason: required if action is REJECTED
 */
exports.processApproval = async ({ type, id, action, user, rejectionReason = null }) => {
  let entry;

  // Fetch the correct document
  if (type === ENTRY_TYPE.INCOME) {
    entry = await Income.findById(id);
  } else if (type === ENTRY_TYPE.EXPENSE) {
    entry = await Expense.findById(id);
  } else {
    throw new Error('Invalid type. Must be INCOME or EXPENSE');
  }

  if (!entry) throw new Error(`${type} entry not found`);

  // Check if already processed
  if (entry.approval.status !== ACCOUNTING_STATUS.PENDING) {
    throw new Error(`Cannot update. ${type} is already ${entry.approval.status}`);
  }

  // Validate action
  if (![ACCOUNTING_STATUS.APPROVED, ACCOUNTING_STATUS.REJECTED].includes(action)) {
    throw new Error('Invalid approval action. Must be APPROVED or REJECTED');
  }

  // Apply approval
  entry.approval.status = action;
  entry.approval.approvedBy = user._id;
  entry.approval.approvedAt = new Date();
  entry.approval.reason = action === ACCOUNTING_STATUS.REJECTED ? rejectionReason : null;

  await entry.save();

  // TODO: Trigger ledger posting if APPROVED

  return entry;
};

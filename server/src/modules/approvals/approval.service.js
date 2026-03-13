const mongoose = require('mongoose');
const Income = require('../accounting/income/income.model');
const Expense = require('../accounting/expense/expense.model');
const Payroll = require('../accounting/payroll/payroll.model');
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../constants/accounting');
const postingService = require('../accounting/posting.service');

exports.processApproval = async ({
  type,
  id,
  action,
  user,
  rejectionReason = null,
}) => {
  try {
    let entry;

    if (type === ENTRY_TYPE.INCOME) {
      entry = await Income.findById(id);
    } else if (type === ENTRY_TYPE.EXPENSE) {
      entry = await Expense.findById(id);
    } else if (type === ENTRY_TYPE.PAYROLL) {
      entry = await Payroll.findById(id);
    } else {
      throw new Error('Invalid type. Must be INCOME, EXPENSE, or PAYROLL');
    }

    if (!entry) throw new Error(`${type} entry not found`);

    if (entry.approval.status !== ACCOUNTING_STATUS.PENDING) {
      throw new Error(`Cannot update. ${type} is already ${entry.approval.status}`);
    }

    if (![ACCOUNTING_STATUS.APPROVED, ACCOUNTING_STATUS.REJECTED].includes(action)) {
      throw new Error('Invalid approval action');
    }

    if (
      action === ACCOUNTING_STATUS.REJECTED &&
      (!rejectionReason || rejectionReason.trim() === '')
    ) {
      throw new Error('Rejection reason is required when rejecting an entry');
    }

    entry.status = action;
    entry.approval.status = action;
    entry.approval.approvedBy = user._id;
    entry.approval.approvedAt = new Date();
    entry.approval.reason =
      action === ACCOUNTING_STATUS.REJECTED ? rejectionReason : null;

    await entry.save();

    if (action === ACCOUNTING_STATUS.APPROVED) {
      await postingService.postToLedger({
        entryType: type,
        entry,
        approvedBy: user
      });
    }

    return entry;
  } catch (error) {
    throw error;
  }
};

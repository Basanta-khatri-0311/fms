const Income = require('../accounting/income/income.model')
const Expense = require('../accounting/expense/expense.model')

const { ACCOUNTING_STATUS } = require('../../constants/accounting')


const getModelByType = (type) => {
    if (type === 'INCOME') return Income;
    if (type === 'EXPENSE') return Expense;
    throw new Error('Invalid approval type');
}

exports.processApproval = async ({ type, id, action, user, rejectionReason }) => {
    const Model = getModelByType(type);
    const record = await Model.findById(id);

    if (!record) throw new Error(`${type} record not found`);

    if (record.status !== ACCOUNTING_STATUS.PENDING) {
    throw new Error('Only PENDING records can be approved or rejected');
  }

  if (action === 'APPROVE') {
    record.status = ACCOUNTING_STATUS.APPROVED;
    record.approvedBy = user._id;
    record.approvedAt = new Date();
  }

  if (action === 'REJECT') {
    if (!rejectionReason) {
      throw new Error('Rejection reason is required');
    }
    record.status = ACCOUNTING_STATUS.REJECTED;
    record.rejectionReason = rejectionReason;
  }
  await record.save();

  /**
   * 🔜 NEXT:
   * - Ledger posting
   * - Audit logging
   */

  return record

}
const ACCOUNTING_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

const ENTRY_TYPE = Object.freeze({
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
});

module.exports = {
  ACCOUNTING_STATUS,
  ENTRY_TYPE,
};

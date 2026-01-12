// this module is for 
// Decide debit & credit
// Create ledger entries

// Receptionist
//    ↓
// Income / Expense (PENDING)
//    ↓
// Approval Service
//    ↓ (only if APPROVED)
// Posting Service
//    ↓
// Ledger Entries
//    ↓
// Reports


const ledgerService = require('./ledger/ledger.service');
const ChartOfAccount = require('./coa/coa.model');
const { ENTRY_TYPE, ACCOUNTING_STATUS } = require('../../constants/accounting');

exports.postToLedger = async ({ entry, entryType, approvedBy }) => {
  if (entry.status !== ACCOUNTING_STATUS.APPROVED) {
    throw new Error('Only approved entries can be posted to ledger');
  }

  // Resolve accounts from COA
  let debitAccount;
  let creditAccount;

  if (entryType === ENTRY_TYPE.INCOME) {
    debitAccount = await ChartOfAccount.findOne({ code: 'CASH' });
    creditAccount = await ChartOfAccount.findOne({ code: 'CONSULTANCY_INCOME' });
  }

  if (entryType === ENTRY_TYPE.EXPENSE) {
    debitAccount = await ChartOfAccount.findOne({ code: 'OFFICE_EXPENSE' });
    creditAccount = await ChartOfAccount.findOne({ code: 'CASH' });
  }

  if (!debitAccount || !creditAccount) {
    throw new Error('Posting accounts not configured');
  }

  // ledger entry CREATION
  await ledgerService.createLedgerEntry({
    entryType,
    referenceId: entry._id,
    debitAccount: debitAccount._id,
    creditAccount: creditAccount._id,
    amount: entry.netAmount || entry.netPayable,
    narration: `${entryType} approved`,
    createdBy: entry.createdBy,
    approvedBy,
    financialYear: entry.financialYear,
  });
};

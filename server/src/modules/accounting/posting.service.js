const ledgerService = require('./ledger/ledger.service');
const ChartOfAccount = require('./coa/coa.model');
const { ENTRY_TYPE, ACCOUNTING_STATUS } = require('../../constants/accounting');

const COA_CODES = {
  CASH: 'CASH',
  BANK: 'BANK',
  CONSULTANCY_INCOME: 'CONSULTANCY_INCOME',
  OFFICE_EXPENSE: 'OFFICE_EXPENSE',
  VAT_PAYABLE: 'VAT_PAYABLE',
  TDS_PAYABLE: 'TDS_PAYABLE',
};

const getAccount = async (code) => {
  const acc = await ChartOfAccount.findOne({ code });
  if (!acc) throw new Error(`COA not found for code: ${code}`);
  return acc;
};

exports.postToLedger = async ({ entry, entryType, approvedBy }) => {
  if (entry.approval.status !== ACCOUNTING_STATUS.APPROVED) {
    throw new Error('Only approved entries can be posted');
  }

  const debitLines = [];
  const creditLines = [];

  /* =========================
     INCOME POSTING
  ==========================*/
  if (entryType === ENTRY_TYPE.INCOME) {
    const incomeAcc = await getAccount(COA_CODES.CONSULTANCY_INCOME);

    const cashOrBank =
      entry.paymentMode === 'BANK'
        ? await getAccount(COA_CODES.BANK)
        : await getAccount(COA_CODES.CASH);

    // Debit Cash/Bank
    debitLines.push({
      account: cashOrBank._id,
      amount: entry.netAmount,
    });

    // Credit Income
    creditLines.push({
      account: incomeAcc._id,
      amount: entry.amountBeforeVAT,
    });

    // VAT
    if (entry.vatAmount > 0) {
      const vatAcc = await getAccount(COA_CODES.VAT_PAYABLE);
      creditLines.push({
        account: vatAcc._id,
        amount: entry.vatAmount,
      });
    }
  }

  /* =========================
     EXPENSE POSTING
  ==========================*/
  if (entryType === ENTRY_TYPE.EXPENSE) {
    const expenseAcc = await getAccount(COA_CODES.OFFICE_EXPENSE);

    const cashOrBank =
      entry.paymentMode === 'BANK'
        ? await getAccount(COA_CODES.BANK)
        : await getAccount(COA_CODES.CASH);

    // Debit Expense
    debitLines.push({
      account: expenseAcc._id,
      amount: entry.amountBeforeVAT,
    });

    // VAT Input (optional – later)
    if (entry.vatAmount > 0) {
      const vatAcc = await getAccount(COA_CODES.VAT_PAYABLE);
      debitLines.push({
        account: vatAcc._id,
        amount: entry.vatAmount,
      });
    }

    // Credit Cash/Bank
    creditLines.push({
      account: cashOrBank._id,
      amount: entry.netPayable,
    });

    // TDS
    if (entry.tdsAmount > 0) {
      const tdsAcc = await getAccount(COA_CODES.TDS_PAYABLE);
      creditLines.push({
        account: tdsAcc._id,
        amount: entry.tdsAmount,
      });
    }
  }

  /* =========================
     CREATE LEDGER ENTRY
  ==========================*/
  return ledgerService.createLedgerEntry({
    entryType,
    referenceId: entry._id,
    debitLines,
    creditLines,
    narration: `${entryType} approved`,
    createdBy: entry.createdBy,
    approvedBy: approvedBy._id,
    financialYear: entry.financialYear,
  });
};

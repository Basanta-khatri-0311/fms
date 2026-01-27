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
    const vatAcc = await getAccount(COA_CODES.VAT_PAYABLE);
    const advanceAcc = await getAccount('CUSTOMER_ADVANCES');
    const arAcc = await getAccount('ACCOUNTS_RECEIVABLE'); // Add this to your COA seed

    const cashOrBank =
      entry.paymentMode === 'BANK'
        ? await getAccount(COA_CODES.BANK)
        : await getAccount(COA_CODES.CASH);

    //DEBIT: Cash/Bank for the actual amount collected
    if (entry.amountReceived > 0) {
      debitLines.push({
        account: cashOrBank._id,
        amount: entry.amountReceived,
      });
    }

    //DEBIT: Accounts Receivable for what is still owed (Partial Payment)
    if (entry.pendingAmount > 0) {
      debitLines.push({
        account: arAcc._id,
        amount: entry.pendingAmount,
      });
    }

    //CREDIT: Income (The full amount earned)
    creditLines.push({
      account: incomeAcc._id,
      amount: entry.amountBeforeVAT,
    });

    //CREDIT: VAT
    if (entry.vatAmount > 0) {
      creditLines.push({
        account: vatAcc._id,
        amount: entry.vatAmount,
      });
    }

    //CREDIT: Customer Advance (The overpayment)
    if (entry.advanceAmount > 0) {
      creditLines.push({
        account: advanceAcc._id,
        amount: entry.advanceAmount,
      });
    }
  }

/* =========================
   EXPENSE POSTING
==========================*/
if (entryType === ENTRY_TYPE.EXPENSE) {
  const expenseAcc = await getAccount(COA_CODES.OFFICE_EXPENSE);
  const apAcc = await getAccount('ACCOUNTS_PAYABLE');
  const vendorAdvanceAcc = await getAccount('VENDOR_ADVANCES');

  const cashOrBank =
    entry.paymentMode === 'BANK'
      ? await getAccount(COA_CODES.BANK)
      : await getAccount(COA_CODES.CASH);

  //DEBIT: The full Expense amount (Profit & Loss side)
  debitLines.push({
    account: expenseAcc._id,
    amount: entry.amountBeforeVAT,
  });

  // DEBIT: VAT Input (if applicable)
  if (entry.vatAmount > 0) {
    const vatAcc = await getAccount(COA_CODES.VAT_PAYABLE);
    debitLines.push({ account: vatAcc._id, amount: entry.vatAmount });
  }

  //DEBIT: Vendor Advance (If you overpaid the vendor)
  if (entry.advanceAmount > 0) {
    debitLines.push({
      account: vendorAdvanceAcc._id,
      amount: entry.advanceAmount,
    });
  }

  //CREDIT: Cash/Bank (Only the actual amount you physically paid)
  creditLines.push({
    account: cashOrBank._id,
    amount: entry.amountPaid, // Make sure your expense model uses amountPaid
  });

  //CREDIT: Accounts Payable (If you still owe the vendor money)
  if (entry.pendingAmount > 0) {
    creditLines.push({
      account: apAcc._id,
      amount: entry.pendingAmount,
    });
  }

  //CREDIT: TDS
  if (entry.tdsAmount > 0) {
    const tdsAcc = await getAccount(COA_CODES.TDS_PAYABLE);
    creditLines.push({ account: tdsAcc._id, amount: entry.tdsAmount });
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

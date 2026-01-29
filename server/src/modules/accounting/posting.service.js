const ledgerService = require('./ledger/ledger.service');
const ChartOfAccount = require('./coa/coa.model');
const { ENTRY_TYPE, ACCOUNTING_STATUS } = require('../../constants/accounting');

/**
 * Standardized Chart of Account Codes
 * Ensure these codes exist in your ChartOfAccount collection/seed
 */
const COA_CODES = {
  CASH: 'CASH',
  BANK: 'BANK',
  CONSULTANCY_INCOME: 'CONSULTANCY_INCOME',
  OFFICE_EXPENSE: 'OFFICE_EXPENSE',
  VAT_PAYABLE: 'VAT_PAYABLE',      // Liability: Tax collected from customers
  VAT_INPUT: 'VAT_INPUT',          // Asset: Tax paid to vendors (Refundable)
  TDS_PAYABLE: 'TDS_PAYABLE',      // Liability: Tax you deducted from vendor payments
  TDS_RECEIVABLE: 'TDS_RECEIVABLE',// Asset: Tax customer deducted from your payment
  ACCOUNTS_RECEIVABLE: 'ACCOUNTS_RECEIVABLE',
  ACCOUNTS_PAYABLE: 'ACCOUNTS_PAYABLE',
  CUSTOMER_ADVANCES: 'CUSTOMER_ADVANCES',
  VENDOR_ADVANCES: 'VENDOR_ADVANCES',
};

/**
 * Helper to fetch Account ID by Code
 */
const getAccount = async (code) => {
  const acc = await ChartOfAccount.findOne({ code });
  if (!acc) throw new Error(`Chart of Account not found for code: ${code}. Please ensure COA is seeded.`);
  return acc;
};

/**
 * Main Posting Service
 * Triggered by the Approver to convert a Transaction into a Ledger Entry
 */
exports.postToLedger = async ({ entry, entryType, approvedBy }) => {
  // 1. Safety Check: Only approved items can hit the ledger
  if (entry.approval.status !== ACCOUNTING_STATUS.APPROVED) {
    throw new Error('Transaction must be APPROVED before posting to ledger.');
  }

  const debitLines = [];
  const creditLines = [];

  /* ==========================================================================
     INCOME POSTING LOGIC
     Transaction: We provided service to a customer.
     DR Cash/Bank (Received)
     DR Accounts Receivable (Pending)
     DR TDS Receivable (Tax deducted by client - Asset)
     CR Consultancy Income (Gross Revenue)
     CR VAT Payable (Tax to be paid to govt - Liability)
     CR Customer Advance (Overpayment - Liability)
     ========================================================================== */
  if (entryType === ENTRY_TYPE.INCOME) {
    const incomeAcc = await getAccount(COA_CODES.CONSULTANCY_INCOME);
    const vatPayableAcc = await getAccount(COA_CODES.VAT_PAYABLE);
    const tdsReceivableAcc = await getAccount(COA_CODES.TDS_RECEIVABLE);
    const arAcc = await getAccount(COA_CODES.ACCOUNTS_RECEIVABLE);
    const advanceAcc = await getAccount(COA_CODES.CUSTOMER_ADVANCES);

    const cashOrBank = entry.paymentMode === 'BANK' 
      ? await getAccount(COA_CODES.BANK) 
      : await getAccount(COA_CODES.CASH);

    // DEBIT: Assets (What we got or are owed)
    if (entry.amountReceived > 0) {
      debitLines.push({ account: cashOrBank._id, amount: entry.amountReceived });
    }
    if (entry.pendingAmount > 0) {
      debitLines.push({ account: arAcc._id, amount: entry.pendingAmount });
    }
    if (entry.tdsAmount > 0) {
      debitLines.push({ account: tdsReceivableAcc._id, amount: entry.tdsAmount });
    }

    // CREDIT: Revenue & Liabilities
    creditLines.push({ account: incomeAcc._id, amount: entry.amountBeforeVAT });
    
    if (entry.vatAmount > 0) {
      creditLines.push({ account: vatPayableAcc._id, amount: entry.vatAmount });
    }
    if (entry.advanceAmount > 0) {
      creditLines.push({ account: advanceAcc._id, amount: entry.advanceAmount });
    }
  }

  /* ==========================================================================
     EXPENSE POSTING LOGIC
     Transaction: We purchased goods/services from a vendor.
     DR Office Expense (Gross Cost)
     DR VAT Input (Refundable Tax - Asset)
     DR Vendor Advance (Overpayment - Asset)
     CR Cash/Bank (Paid)
     CR Accounts Payable (Still Owed - Liability)
     CR TDS Payable (Tax we deducted to pay govt - Liability)
     ========================================================================== */
  if (entryType === ENTRY_TYPE.EXPENSE) {
    const expenseAcc = await getAccount(COA_CODES.OFFICE_EXPENSE);
    const vatInputAcc = await getAccount(COA_CODES.VAT_INPUT);
    const tdsPayableAcc = await getAccount(COA_CODES.TDS_PAYABLE);
    const apAcc = await getAccount(COA_CODES.ACCOUNTS_PAYABLE);
    const vendorAdvanceAcc = await getAccount(COA_CODES.VENDOR_ADVANCES);

    const cashOrBank = entry.paymentMode === 'BANK' 
      ? await getAccount(COA_CODES.BANK) 
      : await getAccount(COA_CODES.CASH);

    // DEBIT: Costs & Assets
    debitLines.push({ account: expenseAcc._id, amount: entry.amountBeforeVAT });
    
    if (entry.vatAmount > 0) {
      debitLines.push({ account: vatInputAcc._id, amount: entry.vatAmount });
    }
    if (entry.advanceAmount > 0) {
      debitLines.push({ account: vendorAdvanceAcc._id, amount: entry.advanceAmount });
    }

    // CREDIT: Cash/Bank (Actual amount paid out)
    // Note: entry.netPayable is the amount after taxes/discounts
    creditLines.push({ account: cashOrBank._id, amount: entry.netPayable });

    if (entry.pendingAmount > 0) {
      creditLines.push({ account: apAcc._id, amount: entry.pendingAmount });
    }
    if (entry.tdsAmount > 0) {
      creditLines.push({ account: tdsPayableAcc._id, amount: entry.tdsAmount });
    }
  }

  /* =========================
     VALIDATION: DOUBLE ENTRY CHECK
     ==========================*/
  const debitTotal = debitLines.reduce((sum, line) => sum + line.amount, 0);
  const creditTotal = creditLines.reduce((sum, line) => sum + line.amount, 0);

  // Use a small epsilon for float rounding issues (1 paisa)
  if (Math.abs(debitTotal - creditTotal) > 0.01) {
    throw new Error(
      `Ledger Mismatch! DR: ${debitTotal.toFixed(2)}, CR: ${creditTotal.toFixed(2)}. Difference: ${(debitTotal - creditTotal).toFixed(2)}`
    );
  }

  /* =========================
     EXECUTE LEDGER CREATION
     ==========================*/
  return await ledgerService.createLedgerEntry({
    entryType,
    referenceId: entry._id,
    debitLines,
    creditLines,
    narration: `${entryType} Approved - ${entry.name || entry.vendor?.name || 'General Entry'}`,
    createdBy: entry.createdBy,
    approvedBy: approvedBy._id || approvedBy, // Handle object or ID
    financialYear: entry.financialYear,
  });
};
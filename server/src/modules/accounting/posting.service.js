const ledgerService = require('./ledger/ledger.service');
const ChartOfAccount = require('./coa/coa.model');
const User = require('../users/user.model');
const Vendor = require('../vendors/vendor.model');
const { ENTRY_TYPE, ACCOUNTING_STATUS } = require('../../constants/accounting');

/**
 * Standardized Chart of Account Codes
 */
const COA_CODES = {
  CASH: 'CASH',
  BANK: 'BANK',
  CONSULTANCY_INCOME: 'CONSULTANCY_INCOME',
  OFFICE_EXPENSE: 'OFFICE_EXPENSE',
  SALARY_EXPENSE: 'SALARY_EXPENSE',
  STAFF_FUND_PAYABLE: 'STAFF_FUND_PAYABLE',
  VAT_PAYABLE: 'VAT_PAYABLE',      // Liability: Tax collected from customers
  VAT_INPUT: 'VAT_INPUT',          // Asset: Tax paid to vendors (claimable)
  TDS_PAYABLE: 'TDS_PAYABLE',      // Liability: Tax we deduct from vendors
  TDS_RECEIVABLE: 'TDS_RECEIVABLE',// Asset: Tax customers deduct from us
  ACCOUNTS_RECEIVABLE: 'ACCOUNTS_RECEIVABLE',
  ACCOUNTS_PAYABLE: 'ACCOUNTS_PAYABLE',
  CUSTOMER_ADVANCES: 'CUSTOMER_ADVANCES',
  VENDOR_ADVANCES: 'VENDOR_ADVANCES',
  DISCOUNT_GIVEN: 'DISCOUNT_GIVEN',       // Expense/Contra-revenue
  DISCOUNT_RECEIVED: 'DISCOUNT_RECEIVED',  // Income/Contra-expense
};

const getAccount = async (code) => {
  const acc = await ChartOfAccount.findOne({ code });
  if (!acc) throw new Error(`COA not found for code: ${code}. Please seed COA accounts.`);
  return acc;
};

/**
 * Round to 2 decimal places to avoid floating point errors
 */
const round = (num) => Math.round(num * 100) / 100;

/**
 * Main Posting Service - Converts approved transactions to ledger entries
 */
exports.postToLedger = async ({ entry, entryType, approvedBy }) => {
  if (entry.approval.status !== ACCOUNTING_STATUS.APPROVED) {
    throw new Error('Only APPROVED transactions can be posted to ledger');
  }

  const debitLines = [];
  const creditLines = [];

  /* ============================================================================
     INCOME POSTING LOGIC
     
     Scenario: Customer pays us for services
     
     Example:
     - Service: Rs. 10,000
     - VAT (13%): Rs. 1,300
     - Discount: Rs. 500
     - TDS (1.5%): Rs. 150
     - Net Amount: 10,000 + 1,300 - 500 - 150 = Rs. 10,650
     - Amount Received: Rs. 8,000
     - Pending: Rs. 2,650
     
     Journal Entry:
     DR Cash/Bank         8,000  (what we got)
     DR A/R               2,650  (what customer owes)
     DR TDS Receivable      150  (refund from tax office)
        CR Income        10,000  (revenue earned)
        CR VAT Payable    1,300  (owe tax office)
        CR Discount         500  (expense)
     
     Balance: 10,800 = 10,800 ✓
     ============================================================================ */
if (entryType === ENTRY_TYPE.INCOME) {
    const incomeAcc = await getAccount(COA_CODES.CONSULTANCY_INCOME);
    const vatPayableAcc = await getAccount(COA_CODES.VAT_PAYABLE);
    const cashOrBank = entry.paymentMode === 'BANK' 
      ? await getAccount(COA_CODES.BANK) 
      : await getAccount(COA_CODES.CASH);

    // --- DEBIT SIDE (Assets & Expenses) ---
    
    // Actual money received
    if (entry.amountReceived > 0) {
      debitLines.push({ account: cashOrBank._id, amount: round(entry.amountReceived) });
    }

    // Customer still owes us
    if (entry.pendingAmount > 0) {
      const arAcc = await getAccount(COA_CODES.ACCOUNTS_RECEIVABLE);
      debitLines.push({ account: arAcc._id, amount: round(entry.pendingAmount) });
    }

    //Tax customer deducted (Asset)
    if (entry.tdsAmount > 0) {
      const tdsReceivableAcc = await getAccount(COA_CODES.TDS_RECEIVABLE);
      debitLines.push({ account: tdsReceivableAcc._id, amount: round(entry.tdsAmount) });
    }

    //Discount Given is a DEBIT (Expense/Contra-Revenue)
    if (entry.discount > 0) {
      const discountAcc = await getAccount(COA_CODES.DISCOUNT_GIVEN);
      debitLines.push({ account: discountAcc._id, amount: round(entry.discount) });
    }

    // --- CREDIT SIDE (Revenue & Liabilities) ---
    
    //Full revenue amount
    creditLines.push({ account: incomeAcc._id, amount: round(entry.amountBeforeVAT) });

    // Tax we owe the government
    if (entry.vatAmount > 0) {
      creditLines.push({ account: vatPayableAcc._id, amount: round(entry.vatAmount) });
    }

    // Overpayment by customer (Liability)
    if (entry.advanceAmount > 0) {
      const advanceAcc = await getAccount(COA_CODES.CUSTOMER_ADVANCES);
      creditLines.push({ account: advanceAcc._id, amount: round(entry.advanceAmount) });
    }

    // --- STUDENT BALANCE UPDATE ---
    if (entry.studentId) {
      // Net change to student's position
      // increase totalDue if they didn't pay in full
      // increase totalAdvance if they overpaid
      // We also subtract previous dues if this invoice settled them
      const dueDelta = round((entry.pendingAmount || 0) - (entry.previousDue || 0));
      const advanceDelta = round((entry.advanceAmount || 0) - (entry.previousAdvance || 0));

      await User.findByIdAndUpdate(entry.studentId, {
        $inc: {
          totalDue: dueDelta,
          totalAdvance: advanceDelta
        }
      });
    }
  }

  /* ============================================================================
     EXPENSE POSTING LOGIC
     
     Scenario: We pay vendor for goods/services
     
     Example:
     - Purchase: Rs. 5,000
     - VAT (13%): Rs. 650
     - Discount: Rs. 200
     - TDS (1.5%): Rs. 75
     - Net Payable: 5,000 + 650 - 200 - 75 = Rs. 5,375
     - Amount Paid: Rs. 5,375
     - Pending: Rs. 0
     
     Journal Entry:
     DR Expense           5,000  (cost incurred)
     DR VAT Input           650  (can claim refund)
        CR Discount Received 200  (income)
        CR Cash/Bank       5,375  (what we paid)
        CR TDS Payable        75  (owe tax office)
     
     Balance: 5,650 = 5,650 
     ============================================================================ */
  if (entryType === ENTRY_TYPE.EXPENSE) {
    const expenseAcc = await getAccount(COA_CODES.OFFICE_EXPENSE);
    const vatInputAcc = await getAccount(COA_CODES.VAT_INPUT); // Asset!
    const cashOrBank = entry.paymentMode === 'BANK' 
      ? await getAccount(COA_CODES.BANK) 
      : await getAccount(COA_CODES.CASH);

    // DEBIT SIDE: Expenses and assets
    // 1. Expense - Full purchase value
    debitLines.push({
      account: expenseAcc._id,
      amount: round(entry.amountBeforeVAT)
    });

    // 2. VAT Input - Tax we paid (can claim refund - ASSET)
    if (entry.vatAmount > 0) {
      debitLines.push({
        account: vatInputAcc._id,
        amount: round(entry.vatAmount)
      });
    }

    // 3. Vendor Advance - Overpayment (asset)
    if (entry.advanceAmount > 0) {
      const vendorAdvanceAcc = await getAccount(COA_CODES.VENDOR_ADVANCES);
      debitLines.push({
        account: vendorAdvanceAcc._id,
        amount: round(entry.advanceAmount)
      });
    }

    // CREDIT SIDE: Cash out and liabilities
    // 1. Discount Received - Income or contra-expense
    if (entry.discount > 0) {
      const discountAcc = await getAccount(COA_CODES.DISCOUNT_RECEIVED);
      creditLines.push({
        account: discountAcc._id,
        amount: round(entry.discount)
      });
    }

    // Cash/Bank - Actual payment made
    if (entry.amountPaid > 0) {
      creditLines.push({
        account: cashOrBank._id,
        amount: round(entry.amountPaid)
      });
    }

    // Accounts Payable - Still owe vendor
    if (entry.pendingAmount > 0) {
      const apAcc = await getAccount(COA_CODES.ACCOUNTS_PAYABLE);
      creditLines.push({
        account: apAcc._id,
        amount: round(entry.pendingAmount)
      });
    }

    // TDS Payable - Tax we deducted (owe government)
    if (entry.tdsAmount > 0) {
      const tdsPayableAcc = await getAccount(COA_CODES.TDS_PAYABLE);
      creditLines.push({
        account: tdsPayableAcc._id,
        amount: round(entry.tdsAmount)
      });
    }

    // --- VENDOR BALANCE UPDATE ---
    if (entry.vendor) {
      // advanceAmount (+) means vendor owes us (asset)
      // pendingAmount (-) means we owe vendor (liability)
      // Balance definition: (+) you have overpaid them, (-) you owe them.
      const balanceDelta = round((entry.advanceAmount || 0) - (entry.pendingAmount || 0));
      
      await Vendor.findByIdAndUpdate(entry.vendor, {
        $inc: { balance: balanceDelta }
      });
    }
  }
  /* ============================================================================
     PAYROLL POSTING LOGIC
     
     Scenario: We pay an employee their salary
     
     Example:
     - Basic Salary: NRs. 20,000
     - Allowances: NRs. 5,000
     - Gross Salary: NRs. 25,000
     - Tax/TDS: NRs. 2,000
     - PF: NRs. 1,000
     - Net Payable: 25,000 - (2000 + 1000) = NRs. 22,000
     - Amount Paid: NRs. 20,000
     - Pending (Accrued Salary): NRs. 2,000
     
     Journal Entry:
     DR Office Expense (Salary)   25,000  (Total Expense)
        CR TDS Payable               2,000  (Owe tax office)
        CR Cash/Bank                20,000  (What we paid)
        CR Accounts Payable          3,000  (PF + Pending amount we owe)
     
     Note: In a pure system we would have specific charts for Provident Fund Payable and Salaries Payable. 
     For this simplified SME module, we route them through standard AP & TDS.
     ============================================================================ */
  if (entryType === ENTRY_TYPE.PAYROLL) {
    const expenseAcc = await getAccount(COA_CODES.SALARY_EXPENSE); // Specific Salary Expense
    const cashOrBank = entry.paymentMode === 'BANK' 
      ? await getAccount(COA_CODES.BANK) 
      : await getAccount(COA_CODES.CASH);

    // DEBIT SIDE: Expense
    debitLines.push({
      account: expenseAcc._id,
      amount: round(entry.grossSalary)
    });

    // CREDIT SIDE: Liabilities and Cash Out
    
    // Tax Deducted (Liability)
    if (entry.taxDeduction > 0) {
      const tdsPayableAcc = await getAccount(COA_CODES.TDS_PAYABLE);
      creditLines.push({
        account: tdsPayableAcc._id,
        amount: round(entry.taxDeduction)
      });
    }

    // Cash/Bank - Actual payment made
    if (entry.amountPaid > 0) {
      creditLines.push({
        account: cashOrBank._id,
        amount: round(entry.amountPaid)
      });
    }

    // Staff Fund / Provident Fund (Sanchaya Kosh) - Liability we owe the fund
    if (entry.providentFund > 0) {
      const fundAcc = await getAccount(COA_CODES.STAFF_FUND_PAYABLE);
      creditLines.push({
        account: fundAcc._id,
        amount: round(entry.providentFund)
      });
    }

    // Accounts Payable (Unpaid portion of salary)
    if (entry.pendingAmount > 0) {
      const apAcc = await getAccount(COA_CODES.ACCOUNTS_PAYABLE);
      creditLines.push({
        account: apAcc._id,
        amount: round(entry.pendingAmount)
      });
    }
  }

  /* ============================================================================
     VALIDATION: Double Entry Accounting Check
     ============================================================================ */
  const debitTotal = round(debitLines.reduce((sum, line) => sum + line.amount, 0));
  const creditTotal = round(creditLines.reduce((sum, line) => sum + line.amount, 0));

  console.log('\n========== POSTING TO LEDGER ==========');
  console.log(`Type: ${entryType}`);
  console.log(`Entry ID: ${entry._id}`);
  console.log('\nDEBIT LINES:');
  debitLines.forEach((line, i) => {
    console.log(`  ${i + 1}. Amount: ${line.amount.toFixed(2)}`);
  });
  console.log(`TOTAL DEBIT: ${debitTotal.toFixed(2)}`);
  
  console.log('\nCREDIT LINES:');
  creditLines.forEach((line, i) => {
    console.log(`  ${i + 1}. Amount: ${line.amount.toFixed(2)}`);
  });
  console.log(`TOTAL CREDIT: ${creditTotal.toFixed(2)}`);
  
  const difference = round(debitTotal - creditTotal);
  console.log(`\nDIFFERENCE: ${difference.toFixed(2)}`);
  console.log('=====================================\n');

  // Allow 1 paisa difference for rounding
  if (Math.abs(difference) > 0.01) {
    throw new Error(
      `LEDGER NOT BALANCED!\n` +
      `Debit Total: ${debitTotal.toFixed(2)}\n` +
      `Credit Total: ${creditTotal.toFixed(2)}\n` +
      `Difference: ${difference.toFixed(2)}\n` +
      `Please check calculations in ${entryType} entry.`
    );
  }

  /* ============================================================================
     CREATE LEDGER ENTRY
     ============================================================================ */
  return await ledgerService.createLedgerEntry({
    entryType,
    referenceId: entry._id,
    debitLines,
    creditLines,
    narration: `${entryType} - ${entry.name || entry.vendor?.name || entry.employeeName || 'Transaction'} - ${entry.approval.status}`,
    createdBy: entry.createdBy._id || entry.createdBy, 
    approvedBy: approvedBy._id || approvedBy,
    financialYear: entry.financialYear
  });
};
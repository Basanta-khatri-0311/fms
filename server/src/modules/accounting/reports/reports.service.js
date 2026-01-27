// reports.service.js
// Generate Trial Balance, Income Statement, and Balance Sheet
const Ledger = require('../ledger/ledger.model');
const ChartOfAccount = require('../coa/coa.model');
const { ACCOUNT_TYPES } = require('../../../constants/accounting');

/**
 * Get ledger entries for a financial year
 */
const getLedgerEntries = async (financialYear) => {
  return Ledger.find({ financialYear }).populate('debitLines.account creditLines.account');
};

/**
 * Generate Trial Balance
 * Returns an array of { accountName, debitTotal, creditTotal }
 */
exports.generateTrialBalance = async (financialYear) => {
  const entries = await getLedgerEntries(financialYear);

  const balances = {};

  entries.forEach((entry) => {
    // Process debit lines
    entry.debitLines.forEach((line) => {
      const accountName = line.account.name;
      if (!balances[accountName]) {
        balances[accountName] = { debit: 0, credit: 0 };
      }
      balances[accountName].debit += line.amount;
    });

    // Process credit lines
    entry.creditLines.forEach((line) => {
      const accountName = line.account.name;
      if (!balances[accountName]) {
        balances[accountName] = { debit: 0, credit: 0 };
      }
      balances[accountName].credit += line.amount;
    });
  });

  return Object.entries(balances).map(([name, totals]) => ({
    accountName: name,
    debitTotal: totals.debit,
    creditTotal: totals.credit,
    balance: totals.debit - totals.credit,
  }));
};

/**
 * Generate Income Statement
 * Summarizes income and expense accounts
 */
exports.generateIncomeStatement = async (financialYear) => {
  const entries = await getLedgerEntries(financialYear);
  let totalIncome = 0;
  let totalExpense = 0;

  entries.forEach((entry) => {
    // Process credit lines for income
    entry.creditLines.forEach((line) => {
      if (line.account.type === ACCOUNT_TYPES.INCOME) {
        totalIncome += line.amount;
      }
    });

    // Process debit lines for expenses
    entry.debitLines.forEach((line) => {
      if (line.account.type === ACCOUNT_TYPES.EXPENSE) {
        totalExpense += line.amount;
      }
    });
  });

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
  };
};

/**
 * Generate Balance Sheet
 * Summarizes assets, liabilities, and equity
 */
exports.generateBalanceSheet = async (financialYear) => {
  const entries = await getLedgerEntries(financialYear);
  
  // Get the Net Profit
  const incomeStmt = await exports.generateIncomeStatement(financialYear);
  const netProfit = incomeStmt.netProfit;

  const balances = {
    assets: 0,
    liabilities: 0,
    equity: netProfit, // Initial Equity is the current year's profit
  };

  entries.forEach((entry) => {
    entry.debitLines.forEach((line) => {
      if (line.account.type === ACCOUNT_TYPES.ASSET) balances.assets += line.amount;
      // If a liability is debited, it decreases
      if (line.account.type === ACCOUNT_TYPES.LIABILITY) balances.liabilities -= line.amount;
    });

    entry.creditLines.forEach((line) => {
      if (line.account.type === ACCOUNT_TYPES.ASSET) balances.assets -= line.amount;
      if (line.account.type === ACCOUNT_TYPES.LIABILITY) balances.liabilities += line.amount;
    });
  });

  return balances;
};
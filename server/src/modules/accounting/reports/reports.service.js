// reports.service.js - FIXED BALANCE SHEET VERSION
// Generate professional Trial Balance, Income Statement, and Balance Sheet
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
 * Generate Trial Balance with Account Type Grouping
 * Returns hierarchical structure grouped by account type
 */
exports.generateTrialBalance = async (financialYear) => {
  const entries = await getLedgerEntries(financialYear);
  
  // Collect all account balances
  const accountBalances = {};

  entries.forEach((entry) => {
    // Process debit lines
    entry.debitLines.forEach((line) => {
      const accountId = line.account._id.toString();
      if (!accountBalances[accountId]) {
        accountBalances[accountId] = {
          name: line.account.name,
          code: line.account.code,
          type: line.account.type,
          debit: 0,
          credit: 0,
        };
      }
      accountBalances[accountId].debit += line.amount;
    });

    // Process credit lines
    entry.creditLines.forEach((line) => {
      const accountId = line.account._id.toString();
      if (!accountBalances[accountId]) {
        accountBalances[accountId] = {
          name: line.account.name,
          code: line.account.code,
          type: line.account.type,
          debit: 0,
          credit: 0,
        };
      }
      accountBalances[accountId].credit += line.amount;
    });
  });

  // Group accounts by type
  const groupedAccounts = {
    ASSET: [],
    LIABILITY: [],
    EQUITY: [],
    INCOME: [],
    EXPENSE: [],
  };

  Object.values(accountBalances).forEach((account) => {
    const balance = account.debit - account.credit;
    groupedAccounts[account.type].push({
      accountName: account.name,
      accountCode: account.code,
      accountType: account.type,
      debitTotal: account.debit,
      creditTotal: account.credit,
      balance: balance,
    });
  });

  // Calculate subtotals for each group
  const groups = [];
  let grandTotalDebit = 0;
  let grandTotalCredit = 0;

  Object.entries(groupedAccounts).forEach(([type, accounts]) => {
    if (accounts.length > 0) {
      const subtotalDebit = accounts.reduce((sum, acc) => sum + acc.debitTotal, 0);
      const subtotalCredit = accounts.reduce((sum, acc) => sum + acc.creditTotal, 0);
      
      grandTotalDebit += subtotalDebit;
      grandTotalCredit += subtotalCredit;

      groups.push({
        groupName: type,
        groupLabel: getAccountTypeLabel(type),
        accounts: accounts.sort((a, b) => a.accountName.localeCompare(b.accountName)),
        subtotalDebit: subtotalDebit,
        subtotalCredit: subtotalCredit,
        subtotalBalance: subtotalDebit - subtotalCredit,
      });
    }
  });

  return {
    groups,
    grandTotalDebit,
    grandTotalCredit,
    isBalanced: Math.abs(grandTotalDebit - grandTotalCredit) < 0.01,
  };
};

/**
 * Generate Detailed Income Statement
 * Shows revenue breakdown, expense categories, and intermediate calculations
 */
exports.generateIncomeStatement = async (financialYear) => {
  const entries = await getLedgerEntries(financialYear);
  
  // Collect account-level details
  const incomeAccounts = {};
  const expenseAccounts = {};

  entries.forEach((entry) => {
    // Process income (credit lines)
    entry.creditLines.forEach((line) => {
      if (line.account.type === ACCOUNT_TYPES.INCOME) {
        const accountId = line.account._id.toString();
        if (!incomeAccounts[accountId]) {
          incomeAccounts[accountId] = {
            name: line.account.name,
            code: line.account.code,
            amount: 0,
          };
        }
        incomeAccounts[accountId].amount += line.amount;
      }
    });

    // Process expenses (debit lines)
    entry.debitLines.forEach((line) => {
      if (line.account.type === ACCOUNT_TYPES.EXPENSE) {
        const accountId = line.account._id.toString();
        if (!expenseAccounts[accountId]) {
          expenseAccounts[accountId] = {
            name: line.account.name,
            code: line.account.code,
            amount: 0,
          };
        }
        expenseAccounts[accountId].amount += line.amount;
      }
    });
  });

  // Convert to arrays and sort
  const incomeBreakdown = Object.values(incomeAccounts)
    .sort((a, b) => b.amount - a.amount);
  
  const expenseBreakdown = Object.values(expenseAccounts)
    .sort((a, b) => b.amount - a.amount);

  // Calculate totals
  const totalIncome = incomeBreakdown.reduce((sum, acc) => sum + acc.amount, 0);
  const totalExpense = expenseBreakdown.reduce((sum, acc) => sum + acc.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Categorize expenses
  const categorizedExpenses = categorizeExpenses(expenseBreakdown);

  return {
    revenue: {
      breakdown: incomeBreakdown,
      total: totalIncome,
    },
    expenses: {
      breakdown: expenseBreakdown,
      categorized: categorizedExpenses,
      total: totalExpense,
    },
    grossProfit: totalIncome,
    operatingProfit: totalIncome - totalExpense,
    netProfitBeforeTax: totalIncome - totalExpense,
    tax: 0,
    netProfit: netProfit,
    
    // Legacy format for backward compatibility
    totalIncome,
    totalExpense,
  };
};

/**
 * Generate Detailed Balance Sheet - FIXED VERSION
 * Shows assets, liabilities, and equity with proper classification
 */
exports.generateBalanceSheet = async (financialYear) => {
  const entries = await getLedgerEntries(financialYear);
  
  // Get net profit from income statement
  const incomeStmt = await exports.generateIncomeStatement(financialYear);
  const netProfit = incomeStmt.netProfit;

  // Collect account balances by type
  const assetAccounts = {};
  const liabilityAccounts = {};

  entries.forEach((entry) => {
    // Process debit lines
    entry.debitLines.forEach((line) => {
      const accountId = line.account._id.toString();
      const accountType = line.account.type;

      if (accountType === ACCOUNT_TYPES.ASSET) {
        if (!assetAccounts[accountId]) {
          assetAccounts[accountId] = {
            name: line.account.name,
            code: line.account.code,
            balance: 0,
          };
        }
        assetAccounts[accountId].balance += line.amount;
      } else if (accountType === ACCOUNT_TYPES.LIABILITY) {
        if (!liabilityAccounts[accountId]) {
          liabilityAccounts[accountId] = {
            name: line.account.name,
            code: line.account.code,
            balance: 0,
          };
        }
        liabilityAccounts[accountId].balance -= line.amount; // Debit decreases liability
      }
    });

    // Process credit lines
    entry.creditLines.forEach((line) => {
      const accountId = line.account._id.toString();
      const accountType = line.account.type;

      if (accountType === ACCOUNT_TYPES.ASSET) {
        if (!assetAccounts[accountId]) {
          assetAccounts[accountId] = {
            name: line.account.name,
            code: line.account.code,
            balance: 0,
          };
        }
        assetAccounts[accountId].balance -= line.amount; // Credit decreases asset
      } else if (accountType === ACCOUNT_TYPES.LIABILITY) {
        if (!liabilityAccounts[accountId]) {
          liabilityAccounts[accountId] = {
            name: line.account.name,
            code: line.account.code,
            balance: 0,
          };
        }
        liabilityAccounts[accountId].balance += line.amount;
      }
    });
  });

  // Convert to arrays
  const allAssets = Object.values(assetAccounts);
  const allLiabilities = Object.values(liabilityAccounts);

  // Classify assets as current or fixed
  // IMPORTANT: We now ensure ALL assets are included in one category or the other
  const currentAssets = [];
  const fixedAssets = [];
  
  allAssets.forEach(asset => {
    if (isCurrentAsset(asset.name)) {
      currentAssets.push(asset);
    } else {
      // If not current, it goes to fixed (ensures all assets are counted)
      fixedAssets.push(asset);
    }
  });

  // Classify liabilities as current or long-term
  // IMPORTANT: We now ensure ALL liabilities are included
  const currentLiabilities = [];
  const longTermLiabilities = [];
  
  allLiabilities.forEach(liability => {
    if (isCurrentLiability(liability.name)) {
      currentLiabilities.push(liability);
    } else {
      // If not current, it goes to long-term (ensures all liabilities are counted)
      longTermLiabilities.push(liability);
    }
  });

  // Calculate totals
  const totalCurrentAssets = currentAssets.reduce((sum, acc) => sum + acc.balance, 0);
  const totalFixedAssets = fixedAssets.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;

  const totalCurrentLiabilities = currentLiabilities.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLongTermLiabilities = longTermLiabilities.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

  const totalEquity = netProfit;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // Debug logging
  console.log('=== BALANCE SHEET DEBUG ===');
  console.log('Total Assets:', totalAssets);
  console.log('Total Liabilities:', totalLiabilities);
  console.log('Total Equity:', totalEquity);
  console.log('Total L+E:', totalLiabilitiesAndEquity);
  console.log('Difference:', Math.abs(totalAssets - totalLiabilitiesAndEquity));
  console.log('Is Balanced:', Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01);

  return {
    assets: {
      current: {
        accounts: currentAssets,
        total: totalCurrentAssets,
      },
      fixed: {
        accounts: fixedAssets,
        total: totalFixedAssets,
      },
      total: totalAssets,
    },
    liabilities: {
      current: {
        accounts: currentLiabilities,
        total: totalCurrentLiabilities,
      },
      longTerm: {
        accounts: longTermLiabilities,
        total: totalLongTermLiabilities,
      },
      total: totalLiabilities,
    },
    equity: {
      retainedEarnings: netProfit,
      shareCapital: 0,
      total: totalEquity,
    },
    totalLiabilitiesAndEquity: totalLiabilitiesAndEquity,
    isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01,
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get human-readable label for account type
 */
function getAccountTypeLabel(type) {
  const labels = {
    ASSET: 'Assets',
    LIABILITY: 'Liabilities',
    EQUITY: 'Equity',
    INCOME: 'Income',
    EXPENSE: 'Expenses',
  };
  return labels[type] || type;
}

/**
 * Categorize expenses by type
 */
function categorizeExpenses(expenses) {
  const categories = {
    operating: [],
    administrative: [],
    other: [],
  };

  expenses.forEach((expense) => {
    const name = expense.name.toLowerCase();
    
    if (name.includes('salary') || name.includes('wage') || name.includes('rent') || 
        name.includes('utility') || name.includes('office')) {
      categories.operating.push(expense);
    } else if (name.includes('admin') || name.includes('legal') || name.includes('audit')) {
      categories.administrative.push(expense);
    } else {
      categories.other.push(expense);
    }
  });

  return {
    operatingExpenses: {
      accounts: categories.operating,
      total: categories.operating.reduce((sum, acc) => sum + acc.amount, 0),
    },
    administrativeExpenses: {
      accounts: categories.administrative,
      total: categories.administrative.reduce((sum, acc) => sum + acc.amount, 0),
    },
    otherExpenses: {
      accounts: categories.other,
      total: categories.other.reduce((sum, acc) => sum + acc.amount, 0),
    },
  };
}

/**
 * Check if an asset is current (liquid, short-term)
 * Returns true/false instead of filtering
 */
function isCurrentAsset(accountName) {
  const name = accountName.toLowerCase();
  return (
    name.includes('cash') ||
    name.includes('bank') ||
    name.includes('receivable') ||
    name.includes('inventory') ||
    name.includes('prepaid') ||
    (name.includes('advance') && !name.includes('vendor'))
  );
}

/**
 * Check if a liability is current (due within 1 year)
 * Returns true/false instead of filtering
 */
function isCurrentLiability(accountName) {
  const name = accountName.toLowerCase();
  return (
    name.includes('payable') ||
    name.includes('vat payable') ||
    name.includes('tds payable') ||
    (name.includes('advance') && name.includes('customer'))
  );
}
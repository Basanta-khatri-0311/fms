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

  // // Debug logging
  // console.log('=== BALANCE SHEET DEBUG ===');
  // console.log('Total Assets:', totalAssets);
  // console.log('Total Liabilities:', totalLiabilities);
  // console.log('Total Equity:', totalEquity);
  // console.log('Total L+E:', totalLiabilitiesAndEquity);
  // console.log('Difference:', Math.abs(totalAssets - totalLiabilitiesAndEquity));
  // console.log('Is Balanced:', Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01);

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

/**
 * Generate Sales Register (Tax Report)
 */
exports.generateSalesRegister = async (financialYear) => {
  const incomes = await Income.find({ 
    financialYear,
    'approval.status': 'APPROVED'
  }).sort({ 'approval.approvedAt': 1 }); // Sort chronologically

  const salesData = incomes.map(income => ({
    date: income.approval.approvedAt,
    invoiceNumber: income.invoiceNumber || '-',
    buyerName: income.name,
    buyerPan: income.buyerPan || '-',
    serviceType: income.serviceType,
    amountBeforeVAT: income.amountBeforeVAT,
    vatAmount: income.amountVAT || income.vatAmount,
    discount: income.discount,
    tdsAmount: income.tdsAmount,
    netAmount: income.netAmount,
  }));

  const totals = {
    amountBeforeVAT: salesData.reduce((sum, item) => sum + item.amountBeforeVAT, 0),
    vatAmount: salesData.reduce((sum, item) => sum + item.vatAmount, 0),
    discount: salesData.reduce((sum, item) => sum + item.discount, 0),
    tdsAmount: salesData.reduce((sum, item) => sum + item.tdsAmount, 0),
    netAmount: salesData.reduce((sum, item) => sum + item.netAmount, 0),
  };

  return { sales: salesData, totals };
};

/**
 * Generate Purchase Register (Tax Report)
 */
exports.generatePurchaseRegister = async (financialYear) => {
  const expenses = await Expense.find({ 
    financialYear,
    'approval.status': 'APPROVED'
  }).populate('vendor').sort({ 'approval.approvedAt': 1 });

  const purchasesData = expenses.map(expense => ({
    date: expense.approval.approvedAt,
    billNumber: expense.billNumber || '-',
    vendorName: expense.vendor?.name || 'Unknown',
    vendorPan: expense.vendor?.pan || '-',
    amountBeforeVAT: expense.amountBeforeVAT,
    vatAmount: expense.vatAmount,
    discount: expense.discount,
    tdsAmount: expense.tdsAmount,
    netPayable: expense.netPayable,
  }));

  const totals = {
    amountBeforeVAT: purchasesData.reduce((sum, item) => sum + item.amountBeforeVAT, 0),
    vatAmount: purchasesData.reduce((sum, item) => sum + item.vatAmount, 0),
    discount: purchasesData.reduce((sum, item) => sum + item.discount, 0),
    tdsAmount: purchasesData.reduce((sum, item) => sum + item.tdsAmount, 0),
    netPayable: purchasesData.reduce((sum, item) => sum + item.netPayable, 0),
  };

  return { purchases: purchasesData, totals };
};

/**
 * Generate Annex 13 (Tax Return Format)
 */
exports.generateAnnex13 = async (financialYear) => {
  const salesResult = await exports.generateSalesRegister(financialYear);
  const purchaseResult = await exports.generatePurchaseRegister(financialYear);

  return {
    period: financialYear,
    sales: salesResult.totals,
    purchases: purchaseResult.totals,
    summary: {
      totalVatPayable: salesResult.totals.vatAmount, // Tax collected from customers
      totalVatClaimable: purchaseResult.totals.vatAmount, // Tax paid to vendors
      netVatDue: salesResult.totals.vatAmount - purchaseResult.totals.vatAmount, // If positive, owe tax office; if negative, carry forward.
    }
  };
};

/**
 * Generate Income Report
 * Filters: startDate, endDate, serviceType (Headwise), branch
 */
exports.generateIncomeReport = async (financialYear, filters = {}) => {
  const query = { financialYear, 'approval.status': 'APPROVED' };

  if (filters.startDate && filters.endDate) {
    query['approval.approvedAt'] = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate + 'T23:59:59.999Z')
    };
  } else if (filters.startDate) {
    query['approval.approvedAt'] = { $gte: new Date(filters.startDate) };
  } else if (filters.endDate) {
    query['approval.approvedAt'] = { $lte: new Date(filters.endDate + 'T23:59:59.999Z') };
  }

  if (filters.serviceType && filters.serviceType !== 'All') {
    query.serviceType = filters.serviceType;
  }
  if (filters.branch && filters.branch !== 'All') {
    query.branch = filters.branch;
  }

  const incomes = await Income.find(query).sort({ 'approval.approvedAt': -1 });

  const reportData = incomes.map(income => ({
    billNumber: income.invoiceNumber || '-',
    billDate: income.approval.approvedAt,
    partyName: income.name,
    address: income.address || '-',
    contactNumber: income.contactNumber || '-',
    branch: income.branch || 'KTM',
    serviceType: income.serviceType,
    amountBeforeVAT: income.amountBeforeVAT,
    vatAmount: income.vatAmount,
    amountAfterVAT: income.netAmount,
  }));

  const totals = {
    amountBeforeVAT: reportData.reduce((sum, item) => sum + item.amountBeforeVAT, 0),
    vatAmount: reportData.reduce((sum, item) => sum + item.vatAmount, 0),
    amountAfterVAT: reportData.reduce((sum, item) => sum + item.amountAfterVAT, 0),
  };

  return { data: reportData, totals };
};

/**
 * Generate Expenses Report (Integrated Payment and Payroll)
 * Filters: startDate, endDate, category (Headwise), branch
 */
exports.generateExpenseReport = async (financialYear, filters = {}) => {
  const expenseQuery = { financialYear, 'approval.status': 'APPROVED' };
  const payrollQuery = { financialYear, 'approval.status': 'APPROVED' };

  if (filters.startDate && filters.endDate) {
    const dateQuery = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate + 'T23:59:59.999Z')
    };
    expenseQuery['approval.approvedAt'] = dateQuery;
    payrollQuery['approval.approvedAt'] = dateQuery;
  } else if (filters.startDate) {
    const dateQuery = { $gte: new Date(filters.startDate) };
    expenseQuery['approval.approvedAt'] = dateQuery;
    payrollQuery['approval.approvedAt'] = dateQuery;
  } else if (filters.endDate) {
    const dateQuery = { $lte: new Date(filters.endDate + 'T23:59:59.999Z') };
    expenseQuery['approval.approvedAt'] = dateQuery;
    payrollQuery['approval.approvedAt'] = dateQuery;
  }

  if (filters.branch && filters.branch !== 'All') {
    expenseQuery.branch = filters.branch;
    payrollQuery.branch = filters.branch;
  }

  let fetchExpenses = true;
  let fetchPayroll = true;
  if (filters.category && filters.category !== 'All') {
    if (filters.category === 'Payroll' || filters.category === 'Salary') {
      fetchExpenses = false;
    } else {
      expenseQuery.expenseCategory = filters.category;
      fetchPayroll = false;
    }
  }

  const [expenses, payrolls] = await Promise.all([
    fetchExpenses ? Expense.find(expenseQuery).populate('vendor') : Promise.resolve([]),
    fetchPayroll ? Payroll.find(payrollQuery) : Promise.resolve([])
  ]);

  let combinedData = [];

  expenses.forEach(exp => {
    combinedData.push({
      type: 'EXPENSE',
      billNumber: exp.billNumber || '-',
      billDate: exp.approval.approvedAt,
      purchasedFrom: exp.vendor?.name || 'Unknown',
      paymentCategory: exp.expenseCategory || 'General Expense',
      tdsAmount: exp.tdsAmount || 0,
      totalAmountPaid: exp.amountPaid || exp.netPayable || 0,
      branch: exp.branch || 'KTM',
    });
  });

  payrolls.forEach(pr => {
    combinedData.push({
      type: 'PAYROLL',
      billNumber: `PR-${pr.paymentMonth.replace(/\s+/g, '-')}`,
      billDate: pr.approval.approvedAt,
      purchasedFrom: pr.employeeName,
      paymentCategory: 'Payroll',
      tdsAmount: pr.taxDeduction || 0,
      totalAmountPaid: pr.amountPaid || pr.netPayable || 0,
      branch: pr.branch || 'KTM',
    });
  });

  // Sort descending by date
  combinedData.sort((a, b) => new Date(b.billDate) - new Date(a.billDate));

  const totals = {
    tdsAmount: combinedData.reduce((sum, item) => sum + item.tdsAmount, 0),
    totalAmountPaid: combinedData.reduce((sum, item) => sum + item.totalAmountPaid, 0),
  };

  // Generate Group-wise summary
  const groupSummary = {};
  combinedData.forEach(item => {
    if (!groupSummary[item.paymentCategory]) {
      groupSummary[item.paymentCategory] = 0;
    }
    groupSummary[item.paymentCategory] += item.totalAmountPaid;
  });

  const summaryArray = Object.keys(groupSummary).map(k => ({
    category: k,
    total: groupSummary[k]
  }));

  return { data: combinedData, totals, groupSummary: summaryArray };
};

/**
 * Get detailed transaction history for a specific entity
 */
exports.generateEntityHistory = async (type, id) => {
  let history = [];
  let summary = { totalInvoiced: 0, totalPaid: 0, balance: 0 };

  if (type === 'vendor') {
    history = await Expense.find({ vendor: id }).sort({ createdAt: -1 });
    summary.totalInvoiced = history.reduce((sum, item) => sum + item.netPayable, 0);
    summary.totalPaid = history.reduce((sum, item) => sum + item.amountPaid, 0);
    summary.balance = summary.totalInvoiced - summary.totalPaid; // What we owe vendor
  } else if (type === 'student') {
    history = await Income.find({ studentId: id }).sort({ createdAt: -1 });
    summary.totalInvoiced = history.reduce((sum, item) => sum + item.netAmount, 0);
    summary.totalPaid = history.reduce((sum, item) => sum + item.amountReceived, 0);
    summary.balance = summary.totalInvoiced - summary.totalPaid; // What student owes us
  } else if (type === 'employee') {
    // We search by employeeId if available, fallback to name (not ideal but covers transitional period)
    const user = await User.findById(id);
    if (!user) throw new Error('Employee not found');
    
    // Search for payrolls either by ID link or by name match
    history = await Payroll.find({
      $or: [
        { employeeId: id },
        { employeeName: user.name }
      ]
    }).sort({ createdAt: -1 });
    
    summary.totalInvoiced = history.reduce((sum, item) => sum + item.grossSalary, 0);
    summary.totalPaid = history.reduce((sum, item) => sum + item.amountPaid, 0);
    summary.balance = history.reduce((sum, item) => sum + item.pendingAmount, 0); // Unpaid salaries
  }

  return { history, summary };
};

/**
 * Generate Ledger Account Report (Daily Cashbook uses this natively)
 * Given an accountId or accountCode, calculates Opening Balance, all entries, and Closing Balance.
 */
exports.generateLedgerReport = async (financialYear, filters = {}) => {
  const { startDate, endDate, accountId, accountCode } = filters;
  
  // 1. Resolve Account
  let account;
  if (accountId && accountId !== 'All') {
    account = await ChartOfAccount.findById(accountId);
  } else if (accountCode) {
    account = await ChartOfAccount.findOne({ code: accountCode });
  }

  if (!account) {
    return { data: [], account: null, openingBalance: 0, closingBalance: 0 };
  }

  const isAssetOrExpense = ['ASSET', 'EXPENSE'].includes(account.type);

  // 2. Fetch all ledger entries in FY prior to endDate
  const query = { financialYear };
  
  if (endDate) {
    query.createdAt = { $lte: new Date(endDate + 'T23:59:59.999Z') };
  }

  const entries = await Ledger.find(query)
    .populate('debitLines.account creditLines.account')
    .sort({ createdAt: 1 });

  let openingBalance = 0; // Negative means credit balance, positive means debit balance
  let runningBalance = 0;
  
  const reportLines = [];

  entries.forEach(entry => {
    // Check if this entry involves our target account
    let isDebitLine = false;
    let isCreditLine = false;
    let amountDebit = 0;
    let amountCredit = 0;
    
    // Check Debits
    entry.debitLines.forEach(line => {
      if (line.account._id.toString() === account._id.toString()) {
         isDebitLine = true;
         amountDebit += line.amount;
      }
    });

    // Check Credits
    entry.creditLines.forEach(line => {
      if (line.account._id.toString() === account._id.toString()) {
         isCreditLine = true;
         amountCredit += line.amount;
      }
    });

    if (isDebitLine || isCreditLine) {
       const isPriorTarget = startDate && new Date(entry.createdAt) < new Date(startDate);
       
       if (isPriorTarget) {
          // It's part of Opening Balance
          if (isAssetOrExpense) openingBalance += amountDebit - amountCredit;
          else openingBalance += amountCredit - amountDebit;
       } else {
          // It's in the reported period
          if (isAssetOrExpense) runningBalance += amountDebit - amountCredit;
          else runningBalance += amountCredit - amountDebit;

          reportLines.push({
            date: entry.createdAt,
            transactionId: entry.referenceId,
            particulars: entry.narration || '-',
            debit: amountDebit,
            credit: amountCredit,
            balance: openingBalance + runningBalance,
          });
       }
    }
  });

  return {
    account: { name: account.name, code: account.code, type: account.type },
    openingBalance,
    data: reportLines,
    closingBalance: openingBalance + runningBalance,
  };
};

/**
 * Get all CoAs for Dropdowns
 */
exports.getAllAccounts = async () => {
  return await ChartOfAccount.find({ isActive: true }).select('name code type').sort({ name: 1 });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get human readable label for account type
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

const Income = require('../income/income.model');
const Expense = require('../expense/expense.model');
const Payroll = require('../payroll/payroll.model');
const User = require('../../users/user.model');




// reports.controller.js
const reportsService = require('./reports.service');

/**
 * GET /reports/trial-balance?financialYear=2081/82
 */
exports.getTrialBalance = async (req, res) => {
  try {
    const { financialYear } = req.query;
    const result = await reportsService.generateTrialBalance(financialYear);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/income-report?financialYear=2081/82&startDate=...&endDate=...&branch=...&serviceType=...
 */
exports.getIncomeReport = async (req, res) => {
  try {
    const { financialYear, startDate, endDate, branch, serviceType } = req.query;
    const filters = { startDate, endDate, branch, serviceType };
    const result = await reportsService.generateIncomeReport(financialYear, filters);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/expense-report?financialYear=2081/82&startDate=...&endDate=...&branch=...&category=...
 */
exports.getExpenseReport = async (req, res) => {
  try {
    const { financialYear, startDate, endDate, branch, category } = req.query;
    const filters = { startDate, endDate, branch, category };
    const result = await reportsService.generateExpenseReport(financialYear, filters);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/ledger?financialYear=2081/82&startDate=...&endDate=...&accountId=...
 */
exports.getLedgerReport = async (req, res) => {
  try {
    const { financialYear, startDate, endDate, accountId } = req.query;
    const filters = { startDate, endDate, accountId };
    const result = await reportsService.generateLedgerReport(financialYear, filters);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/daily-cashbook?financialYear=2081/82&startDate=...&endDate=...&accountId=...
 */
exports.getDailyCashbook = async (req, res) => {
  try {
    const { financialYear, startDate, endDate, accountId } = req.query;
    // Default to a known cash code if none selected initially
    const filters = { startDate, endDate };
    if (accountId && accountId !== 'All') {
       filters.accountId = accountId;
    } else {
       // Just pick CASH by default if nothing is selected
       filters.accountCode = 'CASH';
    }
    const result = await reportsService.generateLedgerReport(financialYear, filters);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/accounts
 */
exports.getAccounts = async (req, res) => {
  try {
    const result = await reportsService.getAllAccounts();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/income-statement?financialYear=2081/82
 */
exports.getIncomeStatement = async (req, res) => {
  try {
    const { financialYear } = req.query;
    const result = await reportsService.generateIncomeStatement(financialYear);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/balance-sheet?financialYear=2081/82
 */
exports.getBalanceSheet = async (req, res) => {
  try {
    const { financialYear } = req.query;
    const result = await reportsService.generateBalanceSheet(financialYear);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/sales-register?financialYear=2081/82
 */
exports.getSalesRegister = async (req, res) => {
  try {
    const { financialYear } = req.query;
    const result = await reportsService.generateSalesRegister(financialYear);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/purchase-register?financialYear=2081/82
 */
exports.getPurchaseRegister = async (req, res) => {
  try {
    const { financialYear } = req.query;
    const result = await reportsService.generatePurchaseRegister(financialYear);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/annex13?financialYear=2081/82
 */
exports.getAnnex13 = async (req, res) => {
  try {
    const { financialYear } = req.query;
    const result = await reportsService.generateAnnex13(financialYear);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/tds-report?financialYear=2081/82&startDate=...&endDate=...
 */
exports.getTDSReport = async (req, res) => {
  try {
    const { financialYear, startDate, endDate } = req.query;
    const result = await reportsService.generateTDSReport(financialYear, { startDate, endDate });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /reports/history/:type/:id
 */
exports.getEntityHistory = async (req, res) => {
  try {
    const { type, id } = req.params;
    const result = await reportsService.generateEntityHistory(type, id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

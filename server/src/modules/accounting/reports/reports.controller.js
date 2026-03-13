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

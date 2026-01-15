// reports.routes.js
const express = require('express');
const reportsRouter = express.Router();
const reportsController = require('./reports.controller');
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles')



reportsRouter.get('/trial-balance', protect, authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR), reportsController.getTrialBalance);
reportsRouter.get('/income-statement', protect, authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR), reportsController.getIncomeStatement);
reportsRouter.get('/balance-sheet', protect, authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR), reportsController.getBalanceSheet);

module.exports = reportsRouter;

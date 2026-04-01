// reports.routes.js
const express = require('express');
const reportsRouter = express.Router();
const reportsController = require('./reports.controller');
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles')



reportsRouter.get(
    '/trial-balance',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getTrialBalance
);

reportsRouter.get(
    '/income-report',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getIncomeReport
);

reportsRouter.get(
    '/expense-report',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getExpenseReport
);

reportsRouter.get(
    '/ledger',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getLedgerReport
);

reportsRouter.get(
    '/daily-cashbook',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getDailyCashbook
);

reportsRouter.get(
    '/accounts',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getAccounts
);

reportsRouter.get(
    '/income-statement',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getIncomeStatement
);

reportsRouter.get(
    '/balance-sheet',
    protect,
    authorize(USER_ROLES.SUPERADMIN,
        USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getBalanceSheet
);

reportsRouter.get(
    '/sales-register',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getSalesRegister
);

reportsRouter.get(
    '/purchase-register',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getPurchaseRegister
);

reportsRouter.get(
    '/annex13',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getAnnex13
);

reportsRouter.get(
    '/tds-report',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER),
    reportsController.getTDSReport
);

reportsRouter.get(
    '/history/:type/:id',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.AUDITOR, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    reportsController.getEntityHistory
);

module.exports = reportsRouter;

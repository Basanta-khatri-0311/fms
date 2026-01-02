const express = require('express')
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const expenseController = require('./expense.controller');

const expenseRoutes = express.Router();

expenseRoutes.post('/', protect,
    authorize(USER_ROLES.RECEPTIONIST, USER_ROLES.APPROVER),
    expenseController.createExpense
)

expenseRoutes.get('/', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    expenseController.getAllExpenses
)

module.exports = expenseRoutes;
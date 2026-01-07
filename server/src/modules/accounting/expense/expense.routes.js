const express = require('express')
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const expenseController = require('./expense.controller');

const expenseRoutes = express.Router();


// Create expense: Receptionist, Approver, Superadmin
expenseRoutes.post('/', protect,
    authorize(USER_ROLES.RECEPTIONIST, USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    expenseController.createExpense
)


// Get all expenses: Approver or Superadmin
expenseRoutes.get('/', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    expenseController.getExpenses
)

module.exports = expenseRoutes;
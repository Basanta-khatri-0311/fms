const express = require('express')
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const expenseController = require('./expense.controller');

const expenseRoutes = express.Router();


// Create expense: Receptionist or Approver
expenseRoutes.post('/', protect,
    authorize(USER_ROLES.RECEPTIONIST, USER_ROLES.APPROVER),
    expenseController.createExpense
)


// Get all expenses: Approver or Superadmin
expenseRoutes.get('/', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    expenseController.getExpenses
)


// Approve / Reject expense: Approver or Superadmin
expenseRoutes.patch('/:id/status', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    expenseController.updateExpenseStatus
)

module.exports = expenseRoutes;
const express = require('express')
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const expenseController = require('./expense.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const expenseRoutes = express.Router();


// Create expense: Receptionist, Approver, Superadmin
expenseRoutes.post('/', protect,
    authorize(USER_ROLES.RECEPTIONIST, USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    upload.single('attachment'),
    expenseController.createExpense
)

// Get all expenses Approver or Superadmin
expenseRoutes.get('/', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN, USER_ROLES.RECEPTIONIST, USER_ROLES.AUDITOR),
    expenseController.getExpenses
)

// Edit expense (only when pending) - Approver / Superadmin
expenseRoutes.patch('/:id', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    upload.single('attachment'),
    expenseController.updateExpense
);

module.exports = expenseRoutes;
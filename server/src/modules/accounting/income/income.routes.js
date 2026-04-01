const express = require('express')
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const incomeController = require('./income.controller');
const upload = require('../../../utils/multer');
const incomeRoutes = express.Router()


//creating income
incomeRoutes.post('/', protect, 
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN, USER_ROLES.RECEPTIONIST), 
    upload.single('attachment'),
    incomeController.createIncome
);

// Edit income (only when pending) - Approver / Superadmin
incomeRoutes.patch('/:id', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    upload.single('attachment'),
    incomeController.updateIncome
);

// Student dashboard
incomeRoutes.get('/student/dashboard', protect,
    authorize(USER_ROLES.STUDENT),
    incomeController.getStudentDashboard
);

//get all incomes
incomeRoutes.get('/', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN, USER_ROLES.RECEPTIONIST, USER_ROLES.AUDITOR),
    incomeController.getIncomes
)

module.exports = incomeRoutes
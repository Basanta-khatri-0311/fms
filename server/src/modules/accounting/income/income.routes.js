const express = require('express')
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const incomeController = require('./income.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const incomeRoutes = express.Router()


incomeRoutes.post('/', protect, 
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN, USER_ROLES.RECEPTIONIST), 
    upload.single('attachment'),
    incomeController.createIncome
);

incomeRoutes.patch('/:id/status', protect, 
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN), 
    upload.single('attachment'),
    incomeController.updateIncomeStatus
);

incomeRoutes.get('/', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN, USER_ROLES.RECEPTIONIST),
    incomeController.getIncomes
)

module.exports = incomeRoutes
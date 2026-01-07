const express = require('express')
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const incomeController = require('./income.controller');

const incomeRoutes = express.Router()


incomeRoutes.post('/', protect,
    authorize(USER_ROLES.RECEPTIONIST, USER_ROLES.APPROVER),
    incomeController.createIncome
);

incomeRoutes.get('/', protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    incomeController.getIncomes
)

module.exports = incomeRoutes
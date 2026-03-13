const express = require('express');
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const payrollController = require('./payroll.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const payrollRoutes = express.Router();

payrollRoutes.post('/', protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    upload.single('attachment'),
    payrollController.createPayroll
);

payrollRoutes.get('/', protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST, USER_ROLES.AUDITOR),
    payrollController.getPayrolls
);

payrollRoutes.patch('/:id', protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    upload.single('attachment'),
    payrollController.updatePayroll
);

module.exports = payrollRoutes;

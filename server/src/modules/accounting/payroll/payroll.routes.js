const express = require('express');
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const payrollController = require('./payroll.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const payrollRoutes = express.Router();

//create a payroll
payrollRoutes.post('/', protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    upload.single('attachment'),
    payrollController.createPayroll
);

//get all payrolls
payrollRoutes.get('/', protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST, USER_ROLES.AUDITOR),
    payrollController.getPayrolls
);

//check exist
payrollRoutes.get('/check-exists', protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    payrollController.checkExists
);

//edit the payroll
payrollRoutes.patch('/:id', protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    upload.single('attachment'),
    payrollController.updatePayroll
);

module.exports = payrollRoutes;

const express = require('express');
const { protect } = require('../auth/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')
const { USER_ROLES } = require('../../constants/roles')
const approvalController = require('./approval.controller')

const approvalRoute = express.Router();

approvalRoute.patch(
    '/:id',
    protect,
    authorize(USER_ROLES.APPROVER, USER_ROLES.SUPERADMIN),
    approvalController.processApproval
);

module.exports = approvalRoute
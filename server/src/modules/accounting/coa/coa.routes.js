const express = require('express');
const { protect } = require('../../auth/auth.middleware');
const { authorize } = require('../../middlewares/role.middleware');
const { USER_ROLES } = require('../../../constants/roles');
const coaController = require('./coa.controller');


const coaRoute = express.Router();



coaRoute.post(
  '/',
  protect,
  authorize(USER_ROLES.SUPERADMIN),
  coaController.createAccount
);

coaRoute.get(
  '/',
  protect,
  authorize(USER_ROLES.SUPERADMIN),
  coaController.getAccounts
);

module.exports = coaRoute;
const express = require('express')
const userRoutes = express.Router()

const { protect } = require('../auth/auth.middleware.js');
const { authorize } = require('../middlewares/role.middleware.js');
const { createUser, getUsers, updateUserStatus, updateUser } = require('./user.controller');
const { USER_ROLES } = require('../../constants/roles');



userRoutes.post('/', protect, authorize(USER_ROLES.SUPERADMIN), createUser);
userRoutes.get('/', protect, authorize(USER_ROLES.SUPERADMIN), getUsers)
userRoutes.patch('/:id/status', protect, authorize(USER_ROLES.SUPERADMIN), updateUserStatus)
userRoutes.patch('/:id', protect, authorize(USER_ROLES.SUPERADMIN), updateUser);


module.exports = userRoutes
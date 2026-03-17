const express = require('express')
const userRoutes = express.Router()

const { protect } = require('../auth/auth.middleware.js');
const { authorize } = require('../middlewares/role.middleware.js');
const { createUser, getUsers, updateUserStatus, updateUser, getEmployees, getStudents } = require('./user.controller');
const { USER_ROLES } = require('../../constants/roles');

userRoutes.post(
    '/',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    createUser
);

userRoutes.get(
    '/',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    getUsers);

userRoutes.get(
    '/employees',
    protect,
    getEmployees
);

userRoutes.get(
    '/students',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.RECEPTIONIST, USER_ROLES.APPROVER),
    getStudents
);

userRoutes.patch(
    '/:id/status',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    updateUserStatus
);

userRoutes.patch(
    '/:id',
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    updateUser
);

module.exports = userRoutes
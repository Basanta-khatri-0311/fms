const express = require('express')
const userRoute = express.Router()

const { protect } = require('../auth/auth.middleware.js');
const { authorize } = require('../middlewares/role.middleware.js');
const { createUser, getUsers, updateUserStatus } = require('./user.controller');



userRoute.post('/', protect, authorize('SUPERADMIN'), createUser);
userRoute.get('/', protect, authorize('SUPERADMIN'), getUsers)
userRoute.patch('/:id/status', protect, authorize('SUPERADMIN'), updateUserStatus)


module.exports = userRoute
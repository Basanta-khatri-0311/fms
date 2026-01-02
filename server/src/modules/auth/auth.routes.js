const express = require('express')
const router = express.Router()
const authController = require('./auth.controller')
const { protect } = require('./auth.middleware')
const { authorize } = require('../middlewares/role.middleware')
const { USER_ROLES } = require('../../constants/roles');

router.post('/register', protect, authorize(USER_ROLES.SUPERADMIN), authController.register)
router.post('/login', authController.login)


module.exports = router;
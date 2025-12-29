const express = require('express')
const router = express.Router()
const authController = require('./auth.controller')
const { protect } = require('./auth.middleware')
const { authorize } = require('../middlewares/role.middleware')

router.post('/register', protect, authorize('SUPERADMIN'), authController.register)
router.post('/login', authController.login)


module.exports = router;
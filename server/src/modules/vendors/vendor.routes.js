const express = require('express')
const { protect } = require('../auth/auth.middleware')
const { authorize } = require('../middlewares/role.middleware')
const { USER_ROLES } = require('../../constants/roles')
const vendorController = require('./vendor.controller')

const vendorRoute = express.Router()

vendorRoute.post('/',
    protect,
    authorize(USER_ROLES.RECEPTIONIST,USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER),
    vendorController.createVendor
)

vendorRoute.get('/', 
    protect,
    authorize(USER_ROLES.SUPERADMIN, USER_ROLES.APPROVER, USER_ROLES.RECEPTIONIST),
    vendorController.getVendors
)

vendorRoute.patch('/:id',
    protect,
    authorize(USER_ROLES.SUPERADMIN),
    vendorController.updateVendor
)

vendorRoute.patch('/:id/status',
    protect,
    authorize(USER_ROLES.SUPERADMIN),
    vendorController.changeVendorStatus
)

module.exports = vendorRoute
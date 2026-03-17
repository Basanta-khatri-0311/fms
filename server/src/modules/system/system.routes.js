const express = require('express');
const router = express.Router();
const systemController = require('./system.controller');
const { protect } = require('../auth/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', systemController.getSettings);

// Only Superadmins and Admins should be able to update settings
router.patch('/', protect, authorize('SUPERADMIN', 'ADMIN'), systemController.updateSettings);

module.exports = router;

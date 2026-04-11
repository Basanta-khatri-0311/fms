const AppError = require('./AppError');
const { USER_ROLES } = require('../constants/roles');

/**
 * Enforces financial integrity rules based on system settings.
 * 
 * @param {Date|string} transactionDate - The date of the transaction being recorded/edited
 * @param {Object} user - The current authenticated user (req.user)
 * @param {Object} settings - The current system settings from DB
 * @throws {AppError} if any constraint is violated
 */
exports.validateAuditControls = (transactionDate, user, settings) => {
    if (!settings || !settings.controls) return;

    const tDate = new Date(transactionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Audit Lock Date (Applies to EVERYONE)
    // If a period is audited/closed, no one should change it without first "unlocking" it in settings.
    if (settings.controls.auditLockDate) {
        const lockDate = new Date(settings.controls.auditLockDate);
        if (tDate <= lockDate) {
            throw new AppError(
                `This transaction date (${tDate.toLocaleDateString()}) is within a locked audit period. Please update the Audit Lock Date in settings if you must modify this.`,
                403
            );
        }
    }

    // 2. Backdating Policy (Admin Override)
    // If blocked, only SuperAdmins can register transactions for past dates.
    if (user.role !== USER_ROLES.SUPERADMIN && settings.controls.allowBackdatedEntries === false) {
        if (tDate < today) {
            throw new AppError(
                'Manual backdating of transactions is disabled for your role. Please record transactions in real-time.',
                403
            );
        }
    }
};

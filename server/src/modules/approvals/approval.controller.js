const approvalService = require('./approval.service')
const { ACCOUNTING_STATUS, ENTRY_TYPE } = require('../../constants/accounting')


exports.processApproval = async (req, res) => {
    try {
        const { type, action, rejectionReason } = req.body;
        const { id } = req.params;

        // Empty input validation
        if (!type || !action) {
            return res.status(400).json({
                message: 'Type, Action and Rejection reason are required',
            });
        }

        if (![ENTRY_TYPE.INCOME, ENTRY_TYPE.EXPENSE].includes(type)) {
            return res.status(400).json({ message: 'Invalid type. Must be INCOME or EXPENSE' });
        }

        if (![ACCOUNTING_STATUS.APPROVED, ACCOUNTING_STATUS.REJECTED].includes(action)) {
            return res.status(400).json({ message: 'Invalid approval action' });
        }

        if (action === ACCOUNTING_STATUS.REJECTED && !rejectionReason) {
            return res.status(400).json({ message: 'Rejection reason is required when rejecting' });
        }

        const result = await approvalService.processApproval({
            type,
            id,
            action,
            user: req.user,
            rejectionReason,
        });

        return res.status(200).json({
            message: `${type} ${action.toLowerCase()}d successfully`,
            data: result,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
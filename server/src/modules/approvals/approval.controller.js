const approvalService = require('./approval.service')
const { APPROVAL_STATUS } = require('../../constants/approval')


exports.processApproval = async (req, res) => {
    try {
        const { type, action, rejectionReason } = req.body;
        const { id } = req.params;

        if (!type || !action) {
            return res.status(400).json({
                message: 'Type, Action and Rejection reason are required',
            });
        }

        if (!Object.values(APPROVAL_STATUS).includes(action)) {
            return res.status(400).json({ message: 'Invalid approval action' });
        }

        if (action === APPROVAL_STATUS.REJECTED && !rejectionReason) {
            return res.status(400).json({
                message: 'Rejection reason is required when rejecting',
            });
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
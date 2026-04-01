const vendorService = require('./vendor.service')
const { VENDOR_STATUS } = require('../../constants/vendor')


exports.createVendor = async (req, res) => {
    try {
        const { name, pan } = req.body;

        if (!name || !pan) {
            return res.status(400).json({
                message: 'Vendor name and PAN are required',
            });
        }

        const vendor = await vendorService.createVendor(req.body, req.user);

        return res.status(201).json({
            message: 'Vendor created successfully',
            data: vendor,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.getVendors = async (req, res) => {
    try {
        const vendors = await vendorService.getVendors();
        return res.status(200).json({
            data: vendors,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

exports.updateVendor = async (req, res) => {
    try {
        const vendor = await vendorService.updateVendor(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            message: 'Vendor updated successfully',
            data: vendor,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}


exports.changeVendorStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!Object.values(VENDOR_STATUS).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const vendor = await vendorService.toggleVendorStatus(
            req.params.id,
            status
        );

        return res.status(200).json({
            message: 'Vendor status updated',
            data: vendor,
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        await vendorService.deleteVendor(req.params.id);
        return res.status(200).json({
            message: 'Vendor deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
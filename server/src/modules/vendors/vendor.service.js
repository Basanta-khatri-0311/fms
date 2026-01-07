const Vendor = require('./vendor.model')
const { VENDOR_STATUS } = require('../../constants/vendor')

exports.createVendor = async (data, user) => {
    const existingVendor = await Vendor.findOne({ pan: data.pan })

    if (existingVendor) {
        throw new Error('Vendor with this PAN already exists')
    }

    return Vendor.create({
        ...data,
        status: VENDOR_STATUS.ACTIVE,
        createdBy: user._id,
    })
}


exports.getVendors = async () => {
    return Vendor.find().sort({ createdAt: -1 })
}

exports.updateVendor = async (id, data) => {
    if (data.pan) {
        throw new Error('Pan cannot be updated')
    }
    return Vendor.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    })
}

exports.toggleVendorStatus = async (id, status) => {
    if (!Object.values(VENDOR_STATUS).includes(status)) {
        throw new Error('Invalid vendor status');
    }
    return Vendor.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );
};
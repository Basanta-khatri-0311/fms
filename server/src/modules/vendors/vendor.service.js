const Vendor = require('./vendor.model')
const { VENDOR_STATUS } = require('../../constants/vendor')
const Expense = require('../accounting/expense/expense.model');

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
    const existing = await Vendor.findById(id);
    if (!existing) throw new Error('Vendor not found');

    if (data.pan && data.pan !== existing.pan) {
        throw new Error('PAN cannot be updated. Please create a new vendor record if you have a new business entity.');
    }

    // Ensure PAN is not accidentally changed or re-saved in wrong format if it was intended to stay the same
    delete data.pan;

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

exports.deleteVendor = async (id) => {
    const hasTransactions = await Expense.exists({ vendor: id });
    if (hasTransactions) {
        throw new Error('Cannot delete vendor as there are existing expense records associated with them. Try deactivating them instead.');
    }
    return Vendor.findByIdAndDelete(id);
};
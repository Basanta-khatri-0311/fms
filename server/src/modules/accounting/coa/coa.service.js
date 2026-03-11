const ChartOfAccount = require('./coa.model');

exports.createAccount = async (data, user) => {
  return await ChartOfAccount.create({
    ...data,
    createdBy: user._id,
  });
};

exports.getAllAccounts = async () => {
  return ChartOfAccount.find().sort({ code: 1 });
};

// Add this:
exports.deleteAccount = async (id) => {
  return await ChartOfAccount.findByIdAndDelete(id);
};

// Add this for your "Edit" functionality:
exports.updateAccount = async (id, data) => {
  return await ChartOfAccount.findByIdAndUpdate(id, data, { new: true });
};
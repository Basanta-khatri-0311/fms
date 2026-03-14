const ChartOfAccount = require('./coa.model');

//create coa functionality
exports.createAccount = async (data, user) => {
  return await ChartOfAccount.create({
    ...data,
    createdBy: user._id,
  });
};

//get all accounts functionality
exports.getAllAccounts = async () => {
  return ChartOfAccount.find().sort({ code: 1 });
};

// delete functionality
exports.deleteAccount = async (id) => {
  return await ChartOfAccount.findByIdAndDelete(id);
};

// Edit functionality:
exports.updateAccount = async (id, data) => {
  return await ChartOfAccount.findByIdAndUpdate(id, data, { new: true });
};
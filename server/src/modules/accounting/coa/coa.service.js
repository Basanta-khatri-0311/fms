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

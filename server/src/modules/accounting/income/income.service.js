const Income = require('./income.model');
const { ACCOUNTING_STATUS } = require('../../../constants/accounting');


exports.createIncome = async (data) => {
  const {
    amountBeforeVAT,
    vatAmount = 0,
    discount = 0,
    amountReceived = 0,
  } = data;

  const netAmount = amountBeforeVAT + vatAmount - discount;
  const pendingAmount = netAmount - amountReceived;

  return await Income.create({
    ...data,
    netAmount,
    pendingAmount,
    status: ACCOUNTING_STATUS.PENDING,
  });
};

exports.getAllIncomes = async () => {
  return await Income.find().sort({ createdAt: -1 });
};
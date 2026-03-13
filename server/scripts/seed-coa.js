const mongoose = require('mongoose');
require('dotenv').config();

const ChartOfAccount = require('../src/modules/accounting/coa/coa.model');
const User = require('../src/modules/users/user.model');
const { ACCOUNT_TYPES } = require('../src/constants/accounting');

const seedCOA = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Find Superadmin
  const superadmin = await User.findOne({ role: 'SUPERADMIN' });

  if (!superadmin) {
    throw new Error('❌ Superadmin not found. Create Superadmin first.');
  }

  // COA list
  const accounts = [
    { name: 'Cash', code: '1000', type: ACCOUNT_TYPES.ASSET },
    { name: 'Accounts Payable', code: '2000', type: ACCOUNT_TYPES.LIABILITY },
    { name: 'Owner Equity', code: '3000', type: ACCOUNT_TYPES.EQUITY },
    { name: 'Sales Income', code: '4000', type: ACCOUNT_TYPES.INCOME },
    { name: 'Office Expense', code: '5000', type: ACCOUNT_TYPES.EXPENSE },
  ].map(acc => ({
    ...acc,
    createdBy: superadmin._id,
  }));

  // Insert
  await ChartOfAccount.insertMany(accounts);

  console.log('✅ Chart of Accounts seeded successfully');
  process.exit();
};

seedCOA().catch(err => {
  console.error(err);
  process.exit(1);
});

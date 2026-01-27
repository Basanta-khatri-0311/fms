const ChartOfAccount = require('../modules/accounting/coa/coa.model');
const User = require('../modules/users/user.model');
const { ACCOUNT_TYPES } = require('../constants/accounting');

const seedCOA = async () => {
    try {
        // Find a Superadmin to be the 'createdBy'
        const admin = await User.findOne({ role: 'SUPERADMIN' });
        if (!admin) {
            console.log('⚠️ No Superadmin found. Skipping COA seeding. Create an admin first.');
            return;
        }

        const coreAccounts = [
            { name: 'Cash in Hand', code: 'CASH', type: ACCOUNT_TYPES.ASSET },
            { name: 'Bank Account', code: 'BANK', type: ACCOUNT_TYPES.ASSET },
            { name: 'Consultancy Income', code: 'CONSULTANCY_INCOME', type: ACCOUNT_TYPES.INCOME },
            { name: 'Office Expense', code: 'OFFICE_EXPENSE', type: ACCOUNT_TYPES.EXPENSE },
            { name: 'VAT Payable', code: 'VAT_PAYABLE', type: ACCOUNT_TYPES.LIABILITY },
            { name: 'TDS Payable', code: 'TDS_PAYABLE', type: ACCOUNT_TYPES.LIABILITY },
            { name: 'Customer Advances', code: 'CUSTOMER_ADVANCES', type: ACCOUNT_TYPES.LIABILITY },
            { name: 'Vendor Advances', code: 'VENDOR_ADVANCES', type: ACCOUNT_TYPES.ASSET },
            { name: 'Accounts Receivable', code: 'ACCOUNTS_RECEIVABLE', type: ACCOUNT_TYPES.ASSET },
            { name: 'Accounts Payable', code: 'ACCOUNTS_PAYABLE', type: ACCOUNT_TYPES.LIABILITY },
        ];

        for (const acc of coreAccounts) {
            const exists = await ChartOfAccount.findOne({ code: acc.code });
            if (!exists) {
                await ChartOfAccount.create({ ...acc, createdBy: admin._id });
                console.log(`🌱 Seeded COA Account: ${acc.code}`);
            }
        }
    } catch (error) {
        console.error('❌ COA Seeding failed:', error.message);
    }
};

module.exports = seedCOA;
const ChartOfAccount = require('../modules/accounting/coa/coa.model');
const User = require('../modules/users/user.model');
const { ACCOUNT_TYPES } = require('../constants/accounting');

const seedCOA = async () => {
    try {
        const admin = await User.findOne({ role: 'SUPERADMIN' });
        // Proceed even if no admin is found (core system accounts)

        const coreAccounts = [
            // === ASSETS ===
            {
                code: 'CASH',
                name: 'Cash in Hand',
                type: ACCOUNT_TYPES.ASSET,
            },
            {
                code: 'BANK',
                name: 'Bank Account',
                type: ACCOUNT_TYPES.ASSET,
            },
            {
                code: 'ACCOUNTS_RECEIVABLE',
                name: 'Accounts Receivable (Trade Debtors)',
                type: ACCOUNT_TYPES.ASSET,
            },
            {
                code: 'TDS_RECEIVABLE',
                name: 'TDS Receivable (Tax Deducted - Refundable)',
                type: ACCOUNT_TYPES.ASSET,
            },
            {
                code: 'VAT_INPUT',
                name: 'VAT Input (Claimable)',
                type: ACCOUNT_TYPES.ASSET,
            },
            {
                code: 'VENDOR_ADVANCES',
                name: 'Vendor Advances (Prepaid)',
                type: ACCOUNT_TYPES.ASSET,
            },

            // === LIABILITIES ===
            {
                code: 'ACCOUNTS_PAYABLE',
                name: 'Accounts Payable (Trade Creditors)',
                type: ACCOUNT_TYPES.LIABILITY,
            },
            {
                code: 'VAT_PAYABLE',
                name: 'VAT Payable (Output Tax)',
                type: ACCOUNT_TYPES.LIABILITY,
            },
            {
                code: 'TDS_PAYABLE',
                name: 'TDS Payable (Tax to be Deposited)',
                type: ACCOUNT_TYPES.LIABILITY,
            },
            {
                code: 'CUSTOMER_ADVANCES',
                name: 'Customer Advances (Unearned Revenue)',
                type: ACCOUNT_TYPES.LIABILITY,
            },
            {
                code: 'STAFF_FUND_PAYABLE',
                name: 'Staff Fund Payable (Sanchaya Kosh)',
                type: ACCOUNT_TYPES.LIABILITY,
            },

            // === INCOME ===
            {
                code: 'CONSULTANCY_INCOME',
                name: 'Consultancy Income',
                type: ACCOUNT_TYPES.INCOME,
            },
            {
                code: 'DISCOUNT_RECEIVED',
                name: 'Discount Received (Vendor Discount)',
                type: ACCOUNT_TYPES.INCOME,
            },

            // === EXPENSES ===
            {
                code: 'OFFICE_EXPENSE',
                name: 'Office Expenses',
                type: ACCOUNT_TYPES.EXPENSE,
            },
            {
                code: 'DISCOUNT_GIVEN',
                name: 'Discount Given (Customer Discount)',
                type: ACCOUNT_TYPES.EXPENSE,
            },
            {
                code: 'SALARY_EXPENSE',
                name: 'Staff Salary Expense',
                type: ACCOUNT_TYPES.EXPENSE,
            },
        ];

        for (const acc of coreAccounts) {
            const exists = await ChartOfAccount.findOne({ code: acc.code });
            if (!exists) {
                await ChartOfAccount.create({ 
                    ...acc, 
                    createdBy: admin ? admin._id : null 
                });
                console.log(`Seeded COA Account: ${acc.code}`);
            }
        }
    } catch (error) {
        console.error('COA Seeding failed:', error.message);
    }
};

module.exports = seedCOA;
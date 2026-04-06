const Income = require('../modules/accounting/income/income.model')
const SystemSetting = require('../modules/system/SystemSetting.model')

exports.generateInvoiceNumber = async (branch, financialYear) => {
    const settings = await SystemSetting.findOne();
    const branchCode = branch || 'GEN';
    const fiscalYear = financialYear || settings?.fiscalYearBS || 'FY';

    // Find the last income record for this branch and year
    const lastInvoice = await Income.findOne({ 
        branch: branchCode,
        financialYear: fiscalYear
    }).sort({ createdAt: -1 });

    let sequence = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
        const parts = lastInvoice.invoiceNumber.split('-');
        const lastSeqStr = parts[parts.length - 1]; // e.g. "00001"
        const lastSeq = parseInt(lastSeqStr);
        if (!isNaN(lastSeq)) sequence = lastSeq + 1;
    }

    return `${branchCode}-INV-${fiscalYear}-${sequence.toString().padStart(5, '0')}`;
};

exports.generateBillNumber = async (branch, financialYear) => {
    const Expense = require('../modules/accounting/expense/expense.model');
    const settings = await SystemSetting.findOne();
    const branchCode = branch || 'GEN';
    const fiscalYear = financialYear || settings?.fiscalYearBS || 'FY';

    const lastExpense = await Expense.findOne({ 
        branch: branchCode,
        financialYear: fiscalYear
    }).sort({ createdAt: -1 });

    let sequence = 1;
    if (lastExpense && lastExpense.billNumber) {
        const parts = lastExpense.billNumber.split('-');
        const lastSeqStr = parts[parts.length - 1];
        const lastSeq = parseInt(lastSeqStr);
        if (!isNaN(lastSeq)) sequence = lastSeq + 1;
    }

    return `${branchCode}-EXP-${fiscalYear}-${sequence.toString().padStart(5, '0')}`;
};
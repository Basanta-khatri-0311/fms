const Income = require('../modules/accounting/income/income.model')
const SystemSetting = require('../modules/system/SystemSetting.model')

exports.generateInvoiceNumber = async (branch, financialYear) => {
    const settings = await SystemSetting.findOne();
    const prefix = settings?.documentSettings?.invoicePrefix || branch || 'INV';
    const fiscalYear = financialYear || settings?.fiscalYearBS || '81/82';

    // Find the last approved invoice that matches this prefix and year
    const lastInvoice = await Income.findOne({ 
        invoiceNumber: new RegExp(`^${prefix}-${fiscalYear}-`) 
    }).sort({ invoiceNumber: -1 });

    let sequence = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
        const parts = lastInvoice.invoiceNumber.split('-');
        sequence = parseInt(parts[parts.length - 1]) + 1;
    }

    return `${prefix}-${fiscalYear}-${sequence.toString().padStart(5, '0')}`;
};
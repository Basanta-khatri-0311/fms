const generateInvoiceNumber = async (branch, financialYear) => {
    // Find the last approved invoice for this branch and year
    const lastInvoice = await Income.findOne({ branch, financialYear, invoiceNumber: { $exists: true } })
        .sort({ invoiceNumber: -1 });

    let sequence = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
        const parts = lastInvoice.invoiceNumber.split('-');
        sequence = parseInt(parts[parts.length - 1]) + 1;
    }

    // Format: KTM-80/81-00001
    return `${branch}-${financialYear}-${sequence.toString().padStart(5, '0')}`;
};
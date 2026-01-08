const Ledger = require('./ledger.model');

exports.createLedgerEntry = async ({
    entryType,
    referenceId,
    debitAccount,
    creditAccount,
    amount,
    narration,
    createdBy,
    approvedBy,
    financialYear
}) => {
    return await Ledger.create({
        entryType,
        referenceId,
        debitAccount,
        creditAccount,
        debitAmount: amount,
        creditAmount: amount,
        narration,
        createdBy,
        approvedBy,
        financialYear,
    });
}
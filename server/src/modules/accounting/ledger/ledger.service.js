const Ledger = require('./ledger.model');

/**
 * Validate accounting equation
 */
const validateBalance = (debitLines, creditLines) => {
  const debitTotal = debitLines.reduce((s, l) => s + l.amount, 0);
  const creditTotal = creditLines.reduce((s, l) => s + l.amount, 0);

  if (debitTotal !== creditTotal) {
    throw new Error(
      `Ledger not balanced: Debit=${debitTotal}, Credit=${creditTotal}`
    );
  }
};

exports.createLedgerEntry = async ({
  entryType,
  referenceId,
  debitLines,
  creditLines,
  narration,
  createdBy,
  approvedBy,
  financialYear,
}) => {
  validateBalance(debitLines, creditLines);

  return Ledger.create({
    entryType,
    referenceId,
    debitLines,
    creditLines,
    narration,
    createdBy,
    approvedBy,
    financialYear,
  });
};

import { useMemo } from 'react';

const round = (num) => Math.round(num * 100) / 100;

const useFinancialCalculations = (formData, mode = 'income') => {
  return useMemo(() => {
    const amountBeforeVAT = parseFloat(formData.amountBeforeVAT) || 0;
    const vatRate = parseFloat(formData.vatRate) || 0;
    const discountRate = parseFloat(formData.discountRate) || 0;
    const tdsRate = parseFloat(formData.tdsRate) || 0;
    
    // Payment amount (Income has amountReceived, Expense has amountPaid)
    const amountHandled = parseFloat(formData.amountReceived || formData.amountPaid) || 0;
    const previousDue = parseFloat(formData.previousDue) || 0;
    const previousAdvance = parseFloat(formData.previousAdvance) || 0;

    let discount = 0, vatAmount = 0, tdsAmount = 0, netAmount = 0;

    if (mode === 'income') {
      vatAmount = round((amountBeforeVAT * vatRate) / 100);
      discount = round((amountBeforeVAT * discountRate) / 100);
      tdsAmount = round((amountBeforeVAT * tdsRate) / 100);
      netAmount = round(amountBeforeVAT + vatAmount - discount - tdsAmount);
    } else {
      discount = round((amountBeforeVAT * discountRate) / 100);
      const taxableAmount = round(amountBeforeVAT - discount);
      vatAmount = round((taxableAmount * vatRate) / 100);
      tdsAmount = round((taxableAmount * tdsRate) / 100);
      netAmount = round(taxableAmount + vatAmount - tdsAmount);
    }

    const adjustedNetAmount = round(netAmount + previousDue - previousAdvance);

    const advanceAmount = amountHandled > adjustedNetAmount ? round(amountHandled - adjustedNetAmount) : 0;
    const pendingAmount = adjustedNetAmount > amountHandled ? round(adjustedNetAmount - amountHandled) : 0;

    return {
      amountBeforeVAT,
      vatRate,
      discountRate,
      tdsRate,
      vatAmount,
      discount,
      tdsAmount,
      netAmount: adjustedNetAmount, // Returning the adjusted net for the UI
      baseNetAmount: netAmount,    // Storing the base for reference if needed
      amountHandled,
      advanceAmount,
      pendingAmount,
      previousDue,
      previousAdvance
    };
  }, [
    formData.amountBeforeVAT, 
    formData.vatRate, 
    formData.discountRate, 
    formData.tdsRate, 
    formData.amountReceived, 
    formData.amountPaid, 
    formData.previousDue,
    formData.previousAdvance,
    mode
  ]);
};

export default useFinancialCalculations;

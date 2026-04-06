import React from 'react';
import { Settings } from 'lucide-react';
import { numberToWords } from '../../utils/numberToWords';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import API from '../../api/axiosConfig';

const InvoiceModal = ({ transaction, onClose }) => {
  const { settings } = useSystemSettings();
  if (!transaction) return null;

  const SERVER_URL = API.defaults.baseURL.replace('/api', '');

  const isIncome = transaction.type === 'INCOME';
  const isPayroll = transaction.type === 'PAYROLL';
  const isExpense = transaction.type === 'EXPENSE';

  const date = new Date(transaction.createdAt).toLocaleDateString();
  const balance = transaction.pendingAmount || 0;
  
  let title = '';
  if (isIncome) {
    title = balance === 0 ? 'Tax Invoice / Bill' : 'Official Receipt';
  } else if (isPayroll) {
    title = 'Payslip';
  } else {
    title = 'Expense Voucher';
  }

  const handlePrint = () => {
    window.print();
  };

  const round = (num) => Math.round(num * 100) / 100;

  const totalPayable = round((transaction.netAmount || transaction.netPayable || 0) + (transaction.previousDue || 0) - (transaction.previousAdvance || 0));
  const amountHandled = isPayroll || isExpense ? (transaction.amountPaid || 0) : (transaction.amountReceived || 0);
  const wordsAmount = amountHandled;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md print:bg-white print:p-0">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col relative print:shadow-none print:w-full print:h-full print:rounded-none animate-in fade-in zoom-in duration-200 scrollbar-hide overflow-hidden">
        
        {/* Controls (Hidden in Print) */}
        <div className="sticky top-0 right-0 p-6 flex justify-end gap-3 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10 print:hidden">
          <button 
            onClick={handlePrint} 
            disabled={isIncome && balance !== 0}
            title={isIncome && balance !== 0 ? "Settlement required to print" : ""}
            className={`px-6 py-3 text-white text-[11px] font-black rounded-xl shadow-lg transition-all uppercase tracking-widest active:scale-95 ${
              isIncome && balance !== 0 
                ? 'bg-slate-300 cursor-not-allowed opacity-60 shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-100'
            }`}
          >
            {isIncome ? (balance === 0 ? 'Print Invoice' : 'Print Receipt') : 'Print Document'}
          </button>
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-white text-slate-500 text-[11px] font-black rounded-xl border border-slate-100 hover:text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95"
          >
            Dismiss
          </button>
        </div>

        {/* Invoice Printable Content */}
        <div className="p-8 sm:p-12 lg:p-16 bg-white" id="printable-invoice">
          
          <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-8 mb-10">
            <div className="space-y-4">
              {settings.logoUrl ? (
                <img src={`${SERVER_URL}${settings.logoUrl}`} alt="Logo" className="h-16 w-auto object-contain mb-4" />
              ) : (
                <div className="p-3 bg-indigo-600 text-white rounded-xl inline-block mb-4">
                   <Settings className="w-8 h-8" />
                </div>
              )}
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase">{title}</h1>
                <div className="flex gap-3">
                  <div className="bg-slate-100 px-3 py-1 text-slate-600 rounded-md font-bold text-sm inline-block">
                    REF: {transaction._id.substring(0, 10).toUpperCase()}
                  </div>
                  {(transaction.invoiceNumber || transaction.billNumber) && (
                    <div className="bg-indigo-50 px-3 py-1 text-indigo-600 rounded-md font-bold text-sm inline-block">
                      {isIncome ? 'INV #' : 'BILL #'}: {transaction.invoiceNumber || transaction.billNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <h2 className="text-2xl font-black text-indigo-700 tracking-tight">{settings.systemName}</h2>
              <p className="text-sm font-semibold text-slate-500 max-w-[250px] ml-auto">{settings.orgDetails?.address || 'Authorized Financial Entity'}</p>
              <p className="text-sm font-semibold text-slate-500">{settings.orgDetails?.phone} {settings.orgDetails?.email && `• ${settings.orgDetails.email}`}</p>
              {settings.orgDetails?.website && <p className="text-sm font-semibold text-indigo-500">{settings.orgDetails.website}</p>}
              <p className="text-sm font-bold text-slate-600">PAN: <span className="text-slate-900">{settings.taxSettings?.panNumber || '---'}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Billed To</p>
              <p className="text-xl font-black text-slate-900 uppercase">{transaction.displayName || transaction.name || transaction.employeeName}</p>
              {isIncome && transaction.buyerPan && (
                <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2">
                  PAN: <span className="text-slate-900">{transaction.buyerPan}</span>
                </p>
              )}
            </div>
            <div className="text-right space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Invoice Details</p>
              <div className="flex justify-end items-center gap-3">
                <span className="text-sm font-bold text-slate-500">Date:</span>
                <span className="text-sm font-black text-slate-900">{date}</span>
              </div>
              <div className="flex justify-end items-center gap-3">
                <span className="text-sm font-bold text-slate-500">Status:</span>
                <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md uppercase tracking-wider">
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-widest text-slate-500">Description</th>
                  <th className="py-4 px-6 text-right text-xs font-black uppercase tracking-widest text-slate-500">Amount ({settings.currencySymbol.replace('.', '')})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="py-5 px-6 text-sm font-bold text-slate-800 tracking-wide">
                    {isPayroll ? 'Basic Salary & Allowances' : isExpense ? 'Vendor Services/Goods' : (transaction.serviceType || 'Consultancy/Service Fee')}
                  </td>
                  <td className="py-5 px-6 text-right text-base font-black text-slate-900 font-mono">
                    {isPayroll ? transaction.grossSalary?.toFixed(2) : transaction.amountBeforeVAT?.toFixed(2)}
                  </td>
                </tr>
              {transaction.discount > 0 && (
                <tr className="bg-rose-50/30">
                  <td className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest pl-10 border-l-[3px] border-rose-400">Less: Discount {transaction.discountRate > 0 && `(${transaction.discountRate}%)`}</td>
                  <td className="py-3 px-6 text-right text-sm font-bold text-rose-600 font-mono">- {transaction.discount?.toFixed(2)}</td>
                </tr>
              )}
              {transaction.vatAmount > 0 && (
                <tr className="bg-indigo-50/30">
                  <td className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest pl-10 border-l-[3px] border-indigo-400">Add: VAT ({transaction.vatRate || settings.taxSettings.vatRate}%)</td>
                  <td className="py-3 px-6 text-right text-sm font-bold text-indigo-600 font-mono">+ {transaction.vatAmount?.toFixed(2)}</td>
                </tr>
              )}
              {transaction.tdsAmount > 0 && !isIncome && (
                <tr className="bg-rose-50/30">
                  <td className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest pl-10 border-l-[3px] border-rose-400">Less: TDS Deducted {transaction.tdsRate > 0 && `(${transaction.tdsRate}%)`}</td>
                  <td className="py-3 px-6 text-right text-sm font-bold text-rose-600 font-mono">- {transaction.tdsAmount?.toFixed(2)}</td>
                </tr>
              )}
              {transaction.taxDeduction > 0 && (
                <tr className="bg-rose-50/30">
                  <td className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest pl-10 border-l-[3px] border-rose-400">Less: Tax Deduction</td>
                  <td className="py-3 px-6 text-right text-sm font-bold text-rose-600 font-mono">- {transaction.taxDeduction?.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          <div className="flex justify-end mb-16">
            <div className="w-full sm:w-80 rounded-2xl bg-slate-900 p-6 shadow-xl print:bg-slate-100 print:shadow-none print:border print:border-slate-300">
              
              <div className="mb-4 space-y-2 border-b border-slate-700 pb-4 print:border-slate-300">
                {/* 1. Item Total */}
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[9px] font-black uppercase tracking-widest">Items Total</span>
                  <span className="text-xs font-bold font-mono">{(transaction.netAmount || transaction.netPayable || 0).toFixed(2)}</span>
                </div>

                {/* 2. Balance Adjustments */}
                {transaction.previousDue > 0 && (
                  <div className="flex justify-between items-center text-rose-400">
                    <span className="text-[9px] font-black uppercase tracking-widest">Prior Due (+)</span>
                    <span className="text-xs font-bold font-mono">+ {transaction.previousDue.toFixed(2)}</span>
                  </div>
                )}
                {transaction.previousAdvance > 0 && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="text-[9px] font-black uppercase tracking-widest">Unused Credit (-)</span>
                    <span className="text-xs font-bold font-mono">- {transaction.previousAdvance.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* 3. Combined Requirement */}
              <div className="flex justify-between items-center mb-6 pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest print:text-slate-600">
                    {isIncome ? 'Total Required' : 'Net Total Due'}
                </span>
                <span className="text-2xl font-black text-white font-mono tracking-tight print:text-slate-900">
                  {settings.currencySymbol} {totalPayable.toFixed(2)}
                </span>
              </div>

              {/* 4. Amount in words (For the payment made) */}
              <div className="mb-6 pb-6 border-b border-slate-700 print:border-slate-300">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Receipt in Words</p>
                <p className="text-[11px] font-extrabold text-indigo-400 leading-tight italic print:text-slate-700">
                  {numberToWords(wordsAmount)}
                </p>
              </div>

              {/* 5. Actual Payment made in this transaction */}
              <div className="flex justify-between items-center py-4 px-4 bg-white/5 rounded-xl border border-white/10 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">
                    {isIncome ? 'Amount Received' : 'Amount Paid'}
                </span>
                <span className="text-base font-black text-white font-mono print:text-slate-900">
                  {settings.currencySymbol} {amountHandled.toFixed(2)}
                </span>
              </div>

              {/* 6. Remaining Balance (if any) */}
              {(transaction.pendingAmount > 0) && (
                <div className="flex justify-between items-center pt-5 mt-5 border-t border-slate-700/50 print:border-slate-200">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                    {isIncome ? 'Total Due (Unpaid)' : (isPayroll ? 'Outstanding Salary' : 'Remaining Balance')}
                  </span>
                  <span className="text-sm font-black text-rose-500 font-mono tracking-wide">
                    {settings.currencySymbol} {transaction.pendingAmount?.toFixed(2)}
                  </span>
                </div>
              )}
              {(transaction.advanceAmount > 0) && (
                <div className="flex justify-between items-center pt-5 mt-5 border-t border-slate-700/50 print:border-slate-200">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                    {isIncome ? 'Excess Credit' : (isPayroll ? 'Advance Provided' : 'Prepayment')}
                  </span>
                  <span className="text-sm font-black text-emerald-500 font-mono tracking-wide">
                    {settings.currencySymbol} {transaction.advanceAmount?.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-center mt-24 pt-10 border-t border-slate-100">
            <div>
              <div className="mx-auto w-48 border-b-2 border-slate-300 mb-3 print:border-slate-800"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-600">Prepared By</p>
            </div>
            <div>
              <div className="mx-auto w-48 border-b-2 border-slate-300 mb-3 print:border-slate-800"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-slate-600">Authorized Signatory</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;

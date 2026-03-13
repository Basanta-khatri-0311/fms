import React from 'react';

const InvoiceModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isIncome = transaction.type === 'INCOME';
  const isPayroll = transaction.type === 'PAYROLL';
  const isExpense = transaction.type === 'EXPENSE';

  const date = new Date(transaction.createdAt).toLocaleDateString();
  const title = isIncome ? 'Tax Invoice / Receipt' : isPayroll ? 'Payslip' : 'Expense Voucher';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col relative print:shadow-none print:w-full print:h-full print:rounded-none">
        
        {/* Controls (Hidden in Print) */}
        <div className="sticky top-0 right-0 p-4 flex justify-end gap-3 bg-white/90 backdrop-blur-md border-b print:hidden">
          <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-indigo-700">
            Print Invoice
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 text-sm font-bold rounded-xl hover:bg-slate-300">
            Close
          </button>
        </div>

        {/* Invoice Printable Content */}
        <div className="p-8 sm:p-12 lg:p-16 bg-white" id="printable-invoice">
          
          <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-8 mb-10">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase">{title}</h1>
              <div className="bg-slate-100 px-3 py-1 text-slate-600 rounded-md font-bold text-sm inline-block">
                REF: {transaction._id.substring(0, 10).toUpperCase()}
              </div>
            </div>
            <div className="text-right space-y-1">
              <h2 className="text-2xl font-black text-indigo-700 tracking-tight">FinCorp Advisory</h2>
              <p className="text-sm font-semibold text-slate-500">123 Business Avenue, Tech Hub</p>
              <p className="text-sm font-semibold text-slate-500">Contact: +977-9800000000</p>
              <p className="text-sm font-bold text-slate-600">PAN / VAT: <span className="text-slate-900">123456789</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-10">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Billed To</p>
              <p className="text-xl font-black text-slate-900 uppercase">{transaction.displayName || transaction.employeeName}</p>
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
                  <th className="py-4 px-6 text-right text-xs font-black uppercase tracking-widest text-slate-500">Amount (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="py-5 px-6 text-sm font-bold text-slate-800 tracking-wide">
                    {isPayroll ? 'Basic Salary & Allowances' : isExpense ? 'Vendor Services/Goods' : 'Consultancy/Service Fee'}
                  </td>
                  <td className="py-5 px-6 text-right text-base font-black text-slate-900 font-mono">
                    {isPayroll ? transaction.grossSalary?.toFixed(2) : transaction.amountBeforeVAT?.toFixed(2)}
                  </td>
                </tr>
              {transaction.discount > 0 && (
                <tr className="bg-rose-50/30">
                  <td className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest pl-10 border-l-[3px] border-rose-400">Less: Discount</td>
                  <td className="py-3 px-6 text-right text-sm font-bold text-rose-600 font-mono">- {transaction.discount?.toFixed(2)}</td>
                </tr>
              )}
              {transaction.vatAmount > 0 && (
                <tr className="bg-indigo-50/30">
                  <td className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest pl-10 border-l-[3px] border-indigo-400">Add: VAT (13%)</td>
                  <td className="py-3 px-6 text-right text-sm font-bold text-indigo-600 font-mono">+ {transaction.vatAmount?.toFixed(2)}</td>
                </tr>
              )}
              {transaction.tdsAmount > 0 && (
                <tr className="bg-rose-50/30">
                  <td className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest pl-10 border-l-[3px] border-rose-400">Less: TDS Deducted</td>
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
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest print:text-slate-600">Net Total</span>
                <span className="text-2xl font-black text-white font-mono tracking-tight print:text-slate-900">
                  Rs. {(isPayroll ? transaction.netPayable : (transaction.netAmount || transaction.netPayable))?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-700 print:border-slate-300">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest print:text-slate-600">Amount Paid</span>
                <span className="text-sm font-bold text-slate-200 font-mono print:text-slate-800">
                  Rs. {(isPayroll ? transaction.amountPaid : (transaction.amountPaid || transaction.amountReceived))?.toFixed(2)}
                </span>
              </div>
              {(transaction.pendingAmount > 0) && (
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-700/50 print:border-slate-200">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest print:text-rose-600">Balance Due</span>
                  <span className="text-sm font-black text-rose-400 font-mono tracking-wide print:text-rose-600">
                    Rs. {transaction.pendingAmount?.toFixed(2)}
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

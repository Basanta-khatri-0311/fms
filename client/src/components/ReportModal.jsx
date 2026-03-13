import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const ReportModal = ({ reportType, financialYear, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = `/reports/${reportType}?financialYear=${financialYear}`;
      const response = await API.get(endpoint);
      setData(response.data.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportType, financialYear]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const exportToCSV = () => {
    if (!data) return;

    let csvContent = '';
    let filename = '';

    if (reportType === 'trial-balance') {
      filename = `trial-balance-${financialYear}.csv`;
      csvContent = 'Account Type,Account Name,Debit,Credit,Balance\n';
      
      data.groups.forEach(group => {
        csvContent += `\n${group.groupLabel}\n`;
        group.accounts.forEach(acc => {
          csvContent += `,"${acc.accountName}",${acc.debitTotal},${acc.creditTotal},${acc.balance}\n`;
        });
        csvContent += `,Subtotal,${group.subtotalDebit},${group.subtotalCredit},${group.subtotalBalance}\n`;
      });
      csvContent += `\nGRAND TOTAL,,${data.grandTotalDebit},${data.grandTotalCredit}\n`;
      
    } else if (reportType === 'income-statement') {
      filename = `income-statement-${financialYear}.csv`;
      csvContent = 'Category,Account,Amount\n';
      csvContent += '\nREVENUE\n';
      data.revenue.breakdown.forEach(acc => {
        csvContent += `,"${acc.name}",${acc.amount}\n`;
      });
      csvContent += `,Total Revenue,${data.revenue.total}\n`;
      csvContent += '\nEXPENSES\n';
      data.expenses.breakdown.forEach(acc => {
        csvContent += `,"${acc.name}",${acc.amount}\n`;
      });
      csvContent += `,Total Expenses,${data.expenses.total}\n`;
      csvContent += `\nNET PROFIT,,${data.netProfit}\n`;
      
    } else if (reportType === 'balance-sheet') {
      filename = `balance-sheet-${financialYear}.csv`;
      csvContent = 'Category,Account,Amount\n';
      csvContent += '\nASSETS\n';
      csvContent += 'Current Assets\n';
      data.assets.current.accounts.forEach(acc => {
        csvContent += `,"${acc.name}",${acc.balance}\n`;
      });
      csvContent += `,Total Current Assets,${data.assets.current.total}\n`;
      csvContent += '\nFixed Assets\n';
      data.assets.fixed.accounts.forEach(acc => {
        csvContent += `,"${acc.name}",${acc.balance}\n`;
      });
      csvContent += `,Total Fixed Assets,${data.assets.fixed.total}\n`;
      csvContent += `,TOTAL ASSETS,${data.assets.total}\n`;
    } else if (reportType === 'sales-register') {
      filename = `sales-register-${financialYear}.csv`;
      csvContent = 'Date,Invoice Number,Buyer Name,Buyer PAN,Service Type,Amount Before VAT,Discount,VAT Amount,TDS Amount,Net Amount\n';
      data.sales.forEach(sale => {
        csvContent += `"${new Date(sale.date).toLocaleDateString()}","${sale.invoiceNumber}","${sale.buyerName}","${sale.buyerPan}","${sale.serviceType}",${sale.amountBeforeVAT},${sale.discount},${sale.vatAmount},${sale.tdsAmount},${sale.netAmount}\n`;
      });
      csvContent += `\nTOTAL,,,,,${data.totals.amountBeforeVAT},${data.totals.discount},${data.totals.vatAmount},${data.totals.tdsAmount},${data.totals.netAmount}\n`;
    } else if (reportType === 'purchase-register') {
      filename = `purchase-register-${financialYear}.csv`;
      csvContent = 'Date,Bill Number,Vendor Name,Vendor PAN,Amount Before VAT,Discount,VAT Amount,TDS Amount,Net Payable\n';
      data.purchases.forEach(purchase => {
        csvContent += `"${new Date(purchase.date).toLocaleDateString()}","${purchase.billNumber}","${purchase.vendorName}","${purchase.vendorPan}",${purchase.amountBeforeVAT},${purchase.discount},${purchase.vatAmount},${purchase.tdsAmount},${purchase.netPayable}\n`;
      });
      csvContent += `\nTOTAL,,,,${data.totals.amountBeforeVAT},${data.totals.discount},${data.totals.vatAmount},${data.totals.tdsAmount},${data.totals.netPayable}\n`;
    } else if (reportType === 'annex13') {
      filename = `annex13-${financialYear}.csv`;
      csvContent = 'Category,Amount Before VAT,Discount,VAT Amount,TDS Amount,Net Amount\n';
      csvContent += `SALES,${data.sales.amountBeforeVAT},${data.sales.discount},${data.sales.vatAmount},${data.sales.tdsAmount},${data.sales.netAmount}\n`;
      csvContent += `PURCHASES,${data.purchases.amountBeforeVAT},${data.purchases.discount},${data.purchases.vatAmount},${data.purchases.tdsAmount},${data.purchases.netPayable}\n`;
      csvContent += `\nSUMMARY\n`;
      csvContent += `Total VAT Collected (Sales),${data.summary.totalVatPayable}\n`;
      csvContent += `Total VAT Paid (Purchases),${data.summary.totalVatClaimable}\n`;
      csvContent += `Net VAT Due,${data.summary.netVatDue}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <span className="text-6xl">⚠️</span>
          <p className="text-rose-600 font-bold text-lg">{error}</p>
          <button
            onClick={fetchReportData}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold 
              hover:bg-indigo-700 transition-all shadow-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-6xl">📭</span>
          <p className="text-slate-500 font-semibold mt-4">No data available for this period</p>
        </div>
      );
    }

    if (reportType === 'trial-balance') {
      return <TrialBalanceView data={data} financialYear={financialYear} />;
    } else if (reportType === 'income-statement') {
      return <IncomeStatementView data={data} financialYear={financialYear} />;
    } else if (reportType === 'balance-sheet') {
      return <BalanceSheetView data={data} financialYear={financialYear} />;
    } else if (reportType === 'sales-register') {
      return <SalesRegisterView data={data} financialYear={financialYear} />;
    } else if (reportType === 'purchase-register') {
      return <PurchaseRegisterView data={data} financialYear={financialYear} />;
    } else if (reportType === 'annex13') {
      return <Annex13View data={data} financialYear={financialYear} />;
    }

    return null;
  };

  const getReportTitle = () => {
    const titles = {
      'trial-balance': 'Trial Balance',
      'income-statement': 'Income Statement',
      'balance-sheet': 'Balance Sheet',
      'sales-register': 'Sales Register',
      'purchase-register': 'Purchase Register',
      'annex13': 'Annex 13 (VAT Return)',
    };
    return titles[reportType] || 'Financial Report';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 bg-slate-800 border-b-2 border-slate-700 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{getReportTitle()}</h2>
              <p className="text-slate-300 text-sm mt-1">
                Financial Year: <span className="font-semibold">{financialYear}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 
                transition-all flex items-center justify-center text-white font-bold text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          {renderReportContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-white border-t-2 border-slate-200 flex flex-col sm:flex-row 
          justify-between items-center gap-4 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={loading || error || !data}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold 
                hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm active:scale-95"
            >
              📊 Export CSV
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-semibold 
                hover:bg-slate-300 transition-all shadow-sm active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PROFESSIONAL TRIAL BALANCE VIEW
const TrialBalanceView = ({ data, financialYear }) => (
  <div className="space-y-6">
    {/* Report Header */}
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Trial Balance</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">As of Financial Year {financialYear}</p>
    </div>

    {/* Info Banner */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-blue-100/50 p-2 rounded-lg text-blue-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">About Trial Balance:</span> Lists all accounts grouped by type with their debit and credit totals. The grand total of debits must structurally equal the grand total of credits.
        </p>
      </div>
    </div>

    {/* Grouped Accounts Table */}
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80">
              <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">
                Account Name
              </th>
              <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Debit
              </th>
              <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Credit
              </th>
              <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.groups.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                {/* Group Header */}
                <tr className="bg-slate-50/50">
                  <td colSpan="4" className="px-6 py-4">
                    <span className="font-bold text-[11px] text-indigo-600 uppercase tracking-widest">
                      {group.groupLabel}
                    </span>
                  </td>
                </tr>
                
                {/* Group Accounts */}
                {group.accounts.map((account, accIdx) => (
                  <tr key={accIdx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 pl-12 text-sm font-medium text-slate-700">
                      {account.accountName}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-slate-600 font-mono">
                      {account.debitTotal > 0 ? account.debitTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-slate-600 font-mono">
                      {account.creditTotal > 0 ? account.creditTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className={`px-6 py-3.5 text-right text-sm font-semibold font-mono ${
                      account.balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                    }`}>
                      {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                
                {/* Group Subtotal */}
                <tr className="bg-slate-50/80 border-t border-slate-200/60">
                  <td className="px-6 py-4 pl-12 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Subtotal
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 font-mono">
                    {group.subtotalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 font-mono">
                    {group.subtotalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 font-mono">
                    {group.subtotalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          
          {/* Grand Total */}
          <tfoot>
            <tr className="bg-slate-900 border-t border-slate-800">
              <td className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">GRAND TOTAL</td>
              <td className="px-6 py-5 text-right text-base font-black text-white font-mono">{data.grandTotalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-5 text-right text-base font-black text-white font-mono">{data.grandTotalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-5 text-right text-sm">
                {data.isBalanced ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Balanced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> Unbalanced
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);

// PROFESSIONAL INCOME STATEMENT VIEW
const IncomeStatementView = ({ data, financialYear }) => (
  <div className="space-y-6">
    {/* Report Header */}
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Income Statement</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">For the Year Ended {financialYear}</p>
    </div>

    {/* Info Banner */}
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-emerald-100/50 p-2 rounded-lg text-emerald-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">Profit & Loss Statement:</span> Shows revenue earned and expenses incurred during the period, resulting in net profit or loss.
        </p>
      </div>
    </div>

    {/* Income Statement Table */}
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-8 space-y-8">
        
        {/* REVENUE SECTION */}
        <div>
          <h5 className="text-[10px] font-black text-indigo-500 mb-3 uppercase tracking-widest border-b border-slate-100 pb-2">
            Operating Revenue
          </h5>
          <div className="space-y-1">
            {data.revenue.breakdown.map((acc, idx) => (
              <div key={idx} className="flex justify-between py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {acc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between py-3 px-4 bg-slate-50 rounded-lg mt-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Revenue</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              {data.revenue.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* EXPENSES SECTION */}
        <div>
          <h5 className="text-[10px] font-black text-rose-500 mb-3 uppercase tracking-widest border-b border-slate-100 pb-2">
            Operating Expenses
          </h5>
          <div className="space-y-1">
            {data.expenses.breakdown.map((acc, idx) => (
              <div key={idx} className="flex justify-between py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {acc.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between py-3 px-4 bg-slate-50 rounded-lg mt-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Expenses</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              {data.expenses.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* NET PROFIT */}
        <div className={`p-8 rounded-2xl border bg-slate-900 ${
          data.netProfit >= 0 
            ? 'border-emerald-500/30' 
            : 'border-rose-500/30'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
              </div>
              <div className="text-sm text-slate-400 font-medium">
                {data.netProfit >= 0 ? 'Profitable operations period' : 'Loss-making operations period'}
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {Math.abs(data.netProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// PROFESSIONAL BALANCE SHEET VIEW
const BalanceSheetView = ({ data, financialYear }) => (
  <div className="space-y-6">
    {/* Report Header */}
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Balance Sheet</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">As of Financial Year {financialYear}</p>
    </div>

    {/* Info Banner */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-blue-100/50 p-2 rounded-lg text-blue-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">Balance Sheet Equation:</span> Assets = Liabilities + Equity. Shows what the company owns and how it's financed.
        </p>
      </div>
    </div>

    {/* Balance Sheet Tables */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* ASSETS */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-5">
          <h5 className="text-[10px] font-black text-indigo-500 tracking-widest uppercase">ASSETS</h5>
        </div>
        <div className="p-6 space-y-6 flex-1">
          
          {/* Current Assets */}
          <div>
            <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Current Assets</h6>
            <div className="space-y-1">
              {data.assets.current.accounts.map((acc, idx) => (
                <div key={idx} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Current Assets</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {data.assets.current.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Fixed Assets */}
          <div>
            <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Fixed Assets</h6>
            <div className="space-y-1">
              {data.assets.fixed.accounts.map((acc, idx) => (
                <div key={idx} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Fixed Assets</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {data.assets.fixed.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Total Assets */}
        <div className="p-6 pt-0 mt-auto">
          <div className="flex justify-between py-4 px-5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-700">
            <span className="text-xs font-black uppercase tracking-widest">TOTAL ASSETS</span>
            <span className="text-lg font-black font-mono">
              {data.assets.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* LIABILITIES & EQUITY */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-5">
          <h5 className="text-[10px] font-black text-rose-500 tracking-widest uppercase">LIABILITIES & EQUITY</h5>
        </div>
        <div className="p-6 space-y-6 flex-1">
          
          {/* Current Liabilities */}
          <div>
            <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Current Liabilities</h6>
            <div className="space-y-1">
              {data.liabilities.current.accounts.map((acc, idx) => (
                <div key={idx} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Current Lib.</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {data.liabilities.current.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Long-term Liabilities */}
          {data.liabilities.longTerm.total > 0 && (
            <div>
              <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Long-term Liabilities</h6>
              <div className="space-y-1">
                {data.liabilities.longTerm.accounts.map((acc, idx) => (
                  <div key={idx} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-sm text-slate-600 font-medium">{acc.name}</span>
                    <span className="text-sm font-semibold text-slate-800 font-mono">
                      {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Long-term Lib.</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {data.liabilities.longTerm.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* Equity */}
          <div>
            <h6 className="font-bold text-[10px] text-slate-400 mb-2 uppercase tracking-widest">Equity</h6>
            <div className="space-y-1">
              <div className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-sm text-slate-600 font-medium">Retained Earnings</span>
                <span className="text-sm font-semibold text-slate-800 font-mono">
                  {data.equity.retainedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="flex justify-between py-3 px-3 bg-slate-50 rounded-lg mt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Equity</span>
              <span className="text-sm font-black text-slate-900 font-mono">
                {data.equity.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Total Liabilities & Equity */}
        <div className="p-6 pt-0 mt-auto">
          <div className="flex justify-between py-4 px-5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-700">
            <span className="text-xs font-black uppercase tracking-widest">TOTAL</span>
            <span className="text-lg font-black font-mono">
              {data.totalLiabilitiesAndEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Balance Status */}
    <div className={`p-4 rounded-xl text-center font-bold text-xs tracking-widest uppercase border ${
      data.isBalanced 
        ? 'bg-emerald-50 border-emerald-500/30 text-emerald-600' 
        : 'bg-rose-50 border-rose-500/30 text-rose-600'
    }`}>
      {data.isBalanced 
        ? '(✓) Balance Sheet is in equilibrium' 
        : '(⚠️) Warning: Balance Sheet is not balanced'}
    </div>
  </div>
);

// PROFESSIONAL SALES REGISTER VIEW
const SalesRegisterView = ({ data, financialYear }) => (
  <div className="space-y-6">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Sales Register</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">For Financial Year {financialYear}</p>
    </div>

    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-amber-100/50 p-2 rounded-lg text-amber-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">Sales Register:</span> Detailed log of all sales invoices including generated VAT out.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80">
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Inv No.</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Buyer & PAN</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Amt</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Discount</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-indigo-500">VAT (13%)</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">TDS</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Net Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.sales.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 text-xs font-semibold text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-xs font-bold text-slate-700">{item.invoiceNumber}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-bold text-slate-800 tracking-wide">{item.buyerName}</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest">PAN: <span className="text-slate-600">{item.buyerPan}</span></div>
                </td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono">{item.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-rose-500 font-mono">{item.discount > 0 ? `-${item.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00'}</td>
                <td className="px-5 py-4 text-right text-sm font-bold text-indigo-600 font-mono">{item.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-rose-500 font-mono">{item.tdsAmount > 0 ? `-${item.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00'}</td>
                <td className="px-5 py-4 text-right text-sm font-black text-slate-900 font-mono">{item.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {data.sales.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                  <span className="block text-2xl mb-2">📄</span>
                  <span className="text-sm font-medium">No sales records found for this period.</span>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 border-t border-slate-800">
              <td colSpan="3" className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL FOR FINANCIAL YEAR:</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-indigo-400 font-mono">{data.totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-base font-black text-white font-mono">{data.totals.netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);

// PROFESSIONAL PURCHASE REGISTER VIEW
const PurchaseRegisterView = ({ data, financialYear }) => (
  <div className="space-y-6">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Register</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">For Financial Year {financialYear}</p>
    </div>

    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100/50 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
      <div className="bg-rose-100/50 p-2 rounded-lg text-rose-600">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      </div>
      <div>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">
          <span className="font-bold text-slate-900">Purchase Register:</span> Detailed log of all expense/purchase bills including VAT in.
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80">
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Bill No.</th>
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Vendor & PAN</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Amt</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Discount</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-indigo-500">VAT (13%)</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">TDS</th>
              <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Net Payable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.purchases.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 text-xs font-semibold text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-xs font-bold text-slate-700">{item.billNumber}</td>
                <td className="px-5 py-4">
                  <div className="text-sm font-bold text-slate-800 tracking-wide">{item.vendorName}</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest">PAN: <span className="text-slate-600">{item.vendorPan}</span></div>
                </td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-600 font-mono">{item.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-indigo-500 font-mono">{item.discount > 0 ? `-${item.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00'}</td>
                <td className="px-5 py-4 text-right text-sm font-bold text-indigo-600 font-mono">{item.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-rose-500 font-mono">{item.tdsAmount > 0 ? `-${item.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00'}</td>
                <td className="px-5 py-4 text-right text-sm font-black text-slate-900 font-mono">{item.netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {data.purchases.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                  <span className="block text-2xl mb-2">🧾</span>
                  <span className="text-sm font-medium">No purchase records found for this period.</span>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 border-t border-slate-800">
              <td colSpan="3" className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL FOR FINANCIAL YEAR:</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-indigo-400 font-mono">{data.totals.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-sm font-black text-white font-mono">{data.totals.tdsAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-5 py-5 text-right text-base font-black text-white font-mono">{data.totals.netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
);

// PROFESSIONAL ANNEX 13 VIEW
const Annex13View = ({ data, financialYear }) => (
  <div className="space-y-8">
    <div className="text-center pb-6 border-b border-slate-200">
      <h3 className="text-sm font-black text-slate-400 tracking-widest uppercase mb-1">FINANCIAL REPORT</h3>
      <h4 className="text-3xl font-black text-slate-900 tracking-tight">Annex 13 - VAT Return</h4>
      <p className="text-sm font-medium text-slate-500 mt-2">For Financial Year {financialYear}</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Sales Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-5">
          <h5 className="text-[10px] font-black text-orange-500 tracking-widest uppercase">SALES (OUTPUT VAT)</h5>
        </div>
        <div className="p-8 space-y-6 flex-1">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Taxable Sales Value</span>
            <span className="font-black text-slate-800 font-mono">{data.sales.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-slate-900">Total Output VAT</span>
            <span className="text-2xl font-black text-orange-600 font-mono">{data.sales.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Purchase Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-100 p-5">
          <h5 className="text-[10px] font-black text-indigo-500 tracking-widest uppercase">PURCHASES (INPUT VAT)</h5>
        </div>
        <div className="p-8 space-y-6 flex-1">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Taxable Purchase Value</span>
            <span className="font-black text-slate-800 font-mono">{data.purchases.amountBeforeVAT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-slate-900">Total Input VAT Available</span>
            <span className="text-2xl font-black text-indigo-600 font-mono">{data.purchases.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Final VAT Calculation */}
    <div className={`rounded-2xl border-2 shadow-xl overflow-hidden ${
      data.summary.netVatDue >= 0 
        ? 'border-slate-800 bg-slate-900 text-white' 
        : 'border-emerald-500 bg-emerald-50 text-emerald-900'
    }`}>
      <div className="p-8 space-y-8">
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className={data.summary.netVatDue >= 0 ? 'text-slate-400' : 'text-emerald-700'}>Output VAT (From Sales)</span>
            <span className="font-mono">{data.summary.totalVatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold">
            <span className={data.summary.netVatDue >= 0 ? 'text-slate-400' : 'text-emerald-700'}>Less: Input VAT (From Purchases)</span>
            <span className="font-mono">- {data.summary.totalVatClaimable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className={`pt-6 border-t ${data.summary.netVatDue >= 0 ? 'border-slate-700' : 'border-emerald-200'}`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${data.summary.netVatDue >= 0 ? 'text-rose-400' : 'text-emerald-600'}`}>
                {data.summary.netVatDue >= 0 ? 'Payable (Due)' : 'Receivable (Credit)'}
              </div>
              <div className={`text-xl font-bold ${data.summary.netVatDue >= 0 ? 'text-white' : 'text-emerald-900'}`}>
                {data.summary.netVatDue >= 0 ? 'Net VAT Due To Tax Office' : 'VAT Carried Forward'}
              </div>
            </div>
            <div className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${data.summary.netVatDue >= 0 ? 'text-rose-400' : 'text-emerald-600'}`}>
              {Math.abs(data.summary.netVatDue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ReportModal;
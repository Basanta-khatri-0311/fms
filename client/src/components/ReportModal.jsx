import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';

const ReportModal = ({ reportType, financialYear, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType, financialYear]);

  const fetchReportData = async () => {
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
  };

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
    }

    return null;
  };

  const getReportTitle = () => {
    const titles = {
      'trial-balance': 'Trial Balance',
      'income-statement': 'Income Statement',
      'balance-sheet': 'Balance Sheet',
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
    <div className="text-center pb-4 border-b-2 border-slate-300">
      <h3 className="text-2xl font-bold text-slate-900">YOUR COMPANY NAME</h3>
      <h4 className="text-lg font-semibold text-slate-700 mt-1">TRIAL BALANCE</h4>
      <p className="text-sm text-slate-600 mt-1">As at End of Financial Year {financialYear}</p>
    </div>

    {/* Info Banner */}
    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
      <p className="text-sm text-indigo-900 font-medium">
        <span className="font-bold">ℹ️ About Trial Balance:</span> Lists all accounts grouped by type 
        with their debit and credit totals. The grand total of debits must equal the grand total of credits.
      </p>
    </div>

    {/* Grouped Accounts Table */}
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800 text-white border-b-2 border-slate-700">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                Account Name
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                Debit
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                Credit
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {data.groups.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                {/* Group Header */}
                <tr className="bg-slate-100">
                  <td colSpan="4" className="px-6 py-3">
                    <span className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                      {group.groupLabel}
                    </span>
                  </td>
                </tr>
                
                {/* Group Accounts */}
                {group.accounts.map((account, accIdx) => (
                  <tr key={accIdx} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                    <td className="px-6 py-3 pl-12 text-sm font-medium text-slate-800">
                      {account.accountName}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-blue-600">
                      {account.debitTotal > 0 ? `Rs. ${account.debitTotal.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-semibold text-emerald-600">
                      {account.creditTotal > 0 ? `Rs. ${account.creditTotal.toLocaleString()}` : '—'}
                    </td>
                    <td className={`px-6 py-3 text-right text-sm font-semibold ${
                      account.balance >= 0 ? 'text-slate-900' : 'text-red-600'
                    }`}>
                      Rs. {account.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
                
                {/* Group Subtotal */}
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td className="px-6 py-3 pl-12 text-sm font-bold text-slate-700">
                    Subtotal - {group.groupLabel}
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">
                    Rs. {group.subtotalDebit.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">
                    Rs. {group.subtotalCredit.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">
                    Rs. {group.subtotalBalance.toLocaleString()}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          
          {/* Grand Total */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold border-t-4 border-slate-700">
              <td className="px-6 py-4 text-sm uppercase tracking-wide">GRAND TOTAL</td>
              <td className="px-6 py-4 text-right text-sm">Rs. {data.grandTotalDebit.toLocaleString()}</td>
              <td className="px-6 py-4 text-right text-sm">Rs. {data.grandTotalCredit.toLocaleString()}</td>
              <td className="px-6 py-4 text-right text-sm">
                {data.isBalanced ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500 rounded-full text-xs">
                    ✓ Balanced
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 rounded-full text-xs">
                    ⚠️ Unbalanced
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
    <div className="text-center pb-4 border-b-2 border-slate-300">
      <h3 className="text-2xl font-bold text-slate-900">YOUR COMPANY NAME</h3>
      <h4 className="text-lg font-semibold text-slate-700 mt-1">INCOME STATEMENT (PROFIT & LOSS)</h4>
      <p className="text-sm text-slate-600 mt-1">For the Year Ended {financialYear}</p>
    </div>

    {/* Info Banner */}
    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
      <p className="text-sm text-emerald-900 font-medium">
        <span className="font-bold">💰 Profit & Loss Statement:</span> Shows revenue earned and expenses 
        incurred during the period, resulting in net profit or loss.
      </p>
    </div>

    {/* Income Statement Table */}
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
      <div className="p-8 space-y-6">
        
        {/* REVENUE SECTION */}
        <div>
          <h5 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide border-b pb-2">
            Revenue
          </h5>
          {data.revenue.breakdown.map((acc, idx) => (
            <div key={idx} className="flex justify-between py-2 px-4 hover:bg-slate-50">
              <span className="text-sm text-slate-700 pl-4">{acc.name}</span>
              <span className="text-sm font-semibold text-slate-900">
                Rs. {acc.amount.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3 px-4 bg-emerald-50 border-t-2 border-emerald-200 mt-2">
            <span className="text-sm font-bold text-emerald-900">Total Revenue</span>
            <span className="text-sm font-bold text-emerald-900">
              Rs. {data.revenue.total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* EXPENSES SECTION */}
        <div>
          <h5 className="text-lg font-bold text-slate-900 mb-3 uppercase tracking-wide border-b pb-2">
            Expenses
          </h5>
          {data.expenses.breakdown.map((acc, idx) => (
            <div key={idx} className="flex justify-between py-2 px-4 hover:bg-slate-50">
              <span className="text-sm text-slate-700 pl-4">{acc.name}</span>
              <span className="text-sm font-semibold text-slate-900">
                Rs. {acc.amount.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3 px-4 bg-rose-50 border-t-2 border-rose-200 mt-2">
            <span className="text-sm font-bold text-rose-900">Total Expenses</span>
            <span className="text-sm font-bold text-rose-900">
              Rs. {data.expenses.total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* NET PROFIT */}
        <div className={`p-6 rounded-xl border-2 ${
          data.netProfit >= 0 
            ? 'bg-blue-600 border-blue-700' 
            : 'bg-red-600 border-red-700'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-white/80 mb-1">
                {data.netProfit >= 0 ? '📈 Net Profit' : '📉 Net Loss'}
              </div>
              <div className="text-xs text-white/70">
                {data.netProfit >= 0 ? 'Profitable operations' : 'Loss-making period'}
              </div>
            </div>
            <div className="text-4xl font-bold text-white">
              Rs. {Math.abs(data.netProfit).toLocaleString()}
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
    <div className="text-center pb-4 border-b-2 border-slate-300">
      <h3 className="text-2xl font-bold text-slate-900">YOUR COMPANY NAME</h3>
      <h4 className="text-lg font-semibold text-slate-700 mt-1">BALANCE SHEET</h4>
      <p className="text-sm text-slate-600 mt-1">As at End of Financial Year {financialYear}</p>
    </div>

    {/* Info Banner */}
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
      <p className="text-sm text-blue-900 font-medium">
        <span className="font-bold">📊 Balance Sheet Equation:</span> Assets = Liabilities + Equity. 
        Shows what the company owns and how it's financed.
      </p>
    </div>

    {/* Balance Sheet Tables */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* ASSETS */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-800 text-white p-4">
          <h5 className="text-lg font-bold uppercase tracking-wide">ASSETS</h5>
        </div>
        <div className="p-6 space-y-4">
          
          {/* Current Assets */}
          <div>
            <h6 className="font-bold text-sm text-slate-700 mb-2 uppercase">Current Assets</h6>
            {data.assets.current.accounts.map((acc, idx) => (
              <div key={idx} className="flex justify-between py-1.5 px-3 hover:bg-slate-50">
                <span className="text-sm text-slate-600 pl-4">{acc.name}</span>
                <span className="text-sm font-semibold text-slate-900">
                  Rs. {acc.balance.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-2 px-3 bg-blue-50 border-t border-blue-200 mt-2">
              <span className="text-xs font-bold text-blue-900">Total Current Assets</span>
              <span className="text-xs font-bold text-blue-900">
                Rs. {data.assets.current.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Fixed Assets */}
          <div>
            <h6 className="font-bold text-sm text-slate-700 mb-2 uppercase">Fixed Assets</h6>
            {data.assets.fixed.accounts.map((acc, idx) => (
              <div key={idx} className="flex justify-between py-1.5 px-3 hover:bg-slate-50">
                <span className="text-sm text-slate-600 pl-4">{acc.name}</span>
                <span className="text-sm font-semibold text-slate-900">
                  Rs. {acc.balance.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-2 px-3 bg-blue-50 border-t border-blue-200 mt-2">
              <span className="text-xs font-bold text-blue-900">Total Fixed Assets</span>
              <span className="text-xs font-bold text-blue-900">
                Rs. {data.assets.fixed.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Total Assets */}
          <div className="flex justify-between py-3 px-3 bg-blue-600 text-white rounded-lg">
            <span className="text-sm font-bold uppercase">TOTAL ASSETS</span>
            <span className="text-sm font-bold">
              Rs. {data.assets.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* LIABILITIES & EQUITY */}
      <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-800 text-white p-4">
          <h5 className="text-lg font-bold uppercase tracking-wide">LIABILITIES & EQUITY</h5>
        </div>
        <div className="p-6 space-y-4">
          
          {/* Current Liabilities */}
          <div>
            <h6 className="font-bold text-sm text-slate-700 mb-2 uppercase">Current Liabilities</h6>
            {data.liabilities.current.accounts.map((acc, idx) => (
              <div key={idx} className="flex justify-between py-1.5 px-3 hover:bg-slate-50">
                <span className="text-sm text-slate-600 pl-4">{acc.name}</span>
                <span className="text-sm font-semibold text-slate-900">
                  Rs. {acc.balance.toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-2 px-3 bg-rose-50 border-t border-rose-200 mt-2">
              <span className="text-xs font-bold text-rose-900">Total Current Liabilities</span>
              <span className="text-xs font-bold text-rose-900">
                Rs. {data.liabilities.current.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Long-term Liabilities */}
          {data.liabilities.longTerm.total > 0 && (
            <div>
              <h6 className="font-bold text-sm text-slate-700 mb-2 uppercase">Long-term Liabilities</h6>
              {data.liabilities.longTerm.accounts.map((acc, idx) => (
                <div key={idx} className="flex justify-between py-1.5 px-3 hover:bg-slate-50">
                  <span className="text-sm text-slate-600 pl-4">{acc.name}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    Rs. {acc.balance.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-2 px-3 bg-rose-50 border-t border-rose-200 mt-2">
                <span className="text-xs font-bold text-rose-900">Total Long-term Liabilities</span>
                <span className="text-xs font-bold text-rose-900">
                  Rs. {data.liabilities.longTerm.total.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Equity */}
          <div>
            <h6 className="font-bold text-sm text-slate-700 mb-2 uppercase">Equity</h6>
            <div className="flex justify-between py-1.5 px-3 hover:bg-slate-50">
              <span className="text-sm text-slate-600 pl-4">Retained Earnings</span>
              <span className="text-sm font-semibold text-slate-900">
                Rs. {data.equity.retainedEarnings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2 px-3 bg-emerald-50 border-t border-emerald-200 mt-2">
              <span className="text-xs font-bold text-emerald-900">Total Equity</span>
              <span className="text-xs font-bold text-emerald-900">
                Rs. {data.equity.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Total Liabilities & Equity */}
          <div className="flex justify-between py-3 px-3 bg-slate-800 text-white rounded-lg">
            <span className="text-sm font-bold uppercase">TOTAL</span>
            <span className="text-sm font-bold">
              Rs. {data.totalLiabilitiesAndEquity.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Balance Status */}
    <div className={`p-4 rounded-xl text-center font-bold border-2 ${
      data.isBalanced 
        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
        : 'bg-red-50 border-red-500 text-red-700'
    }`}>
      {data.isBalanced 
        ? '✓ Balance Sheet is in equilibrium (Assets = Liabilities + Equity)' 
        : '⚠️ Warning: Balance Sheet is not balanced'}
    </div>
  </div>
);

export default ReportModal;
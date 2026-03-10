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
      csvContent = 'Account Name,Debit Total,Credit Total,Balance\n';
      data.forEach(row => {
        csvContent += `"${row.accountName}",${row.debitTotal},${row.creditTotal},${row.balance}\n`;
      });
    } else if (reportType === 'income-statement') {
      filename = `income-statement-${financialYear}.csv`;
      csvContent = 'Description,Amount\n';
      csvContent += `Total Income,${data.totalIncome}\n`;
      csvContent += `Total Expenses,${data.totalExpense}\n`;
      csvContent += `Net Profit,${data.netProfit}\n`;
    } else if (reportType === 'balance-sheet') {
      filename = `balance-sheet-${financialYear}.csv`;
      csvContent = 'Description,Amount\n';
      csvContent += `Total Assets,${data.assets}\n`;
      csvContent += `Total Liabilities,${data.liabilities}\n`;
      csvContent += `Equity,${data.equity}\n`;
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
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <span className="text-6xl">⚠️</span>
          <p className="text-rose-600 font-bold">{error}</p>
          <button
            onClick={fetchReportData}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
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
          <p className="text-slate-500 font-bold mt-4">No data available</p>
        </div>
      );
    }

    // Render specific report based on type
    if (reportType === 'trial-balance') {
      return <TrialBalanceView data={data} />;
    } else if (reportType === 'income-statement') {
      return <IncomeStatementView data={data} />;
    } else if (reportType === 'balance-sheet') {
      return <BalanceSheetView data={data} />;
    }

    return null;
  };

  const getReportTitle = () => {
    const titles = {
      'trial-balance': 'Trial Balance',
      'income-statement': 'Income Statement (P&L)',
      'balance-sheet': 'Balance Sheet',
    };
    return titles[reportType] || 'Financial Report';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-white">{getReportTitle()}</h2>
              <p className="text-slate-300 text-sm mt-1">Financial Year: {financialYear}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 
                transition-all flex items-center justify-center text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderReportContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-500">
            Generated on {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={loading || error || !data}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold 
                hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                text-sm"
            >
              📊 Export CSV
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold 
                hover:bg-slate-300 transition-all text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Trial Balance View Component
const TrialBalanceView = ({ data }) => {
  const totalDebit = data.reduce((sum, row) => sum + row.debitTotal, 0);
  const totalCredit = data.reduce((sum, row) => sum + row.creditTotal, 0);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800 font-bold">
          ℹ️ Trial Balance shows all accounts with their debit and credit totals. 
          Total Debits should equal Total Credits.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-3 text-left text-xs font-black uppercase text-slate-600">
                Account Name
              </th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-600">
                Debit
              </th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-600">
                Credit
              </th>
              <th className="px-4 py-3 text-right text-xs font-black uppercase text-slate-600">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                  {row.accountName}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-blue-600">
                  {row.debitTotal > 0 ? `Rs. ${row.debitTotal.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">
                  {row.creditTotal > 0 ? `Rs. ${row.creditTotal.toLocaleString()}` : '-'}
                </td>
                <td className={`px-4 py-3 text-right text-sm font-bold ${
                  row.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  Rs. {row.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white font-black">
              <td className="px-4 py-4 text-sm uppercase">Total</td>
              <td className="px-4 py-4 text-right text-sm">Rs. {totalDebit.toLocaleString()}</td>
              <td className="px-4 py-4 text-right text-sm">Rs. {totalCredit.toLocaleString()}</td>
              <td className="px-4 py-4 text-right text-sm">
                {Math.abs(totalDebit - totalCredit) < 0.01 ? '✓ Balanced' : '⚠️ Unbalanced'}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// Income Statement View Component
const IncomeStatementView = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
      <p className="text-sm text-emerald-800 font-bold">
        💰 Income Statement (Profit & Loss) shows revenue, expenses, and net profit/loss.
      </p>
    </div>

    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl border-2 border-emerald-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-slate-600">Total Income (Revenue)</span>
          <span className="text-2xl font-black text-emerald-600">
            Rs. {data.totalIncome.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="text-center text-slate-400 font-black text-2xl">−</div>

      <div className="bg-white p-6 rounded-xl border-2 border-rose-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-slate-600">Total Expenses</span>
          <span className="text-2xl font-black text-rose-600">
            Rs. {data.totalExpense.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="text-center text-slate-400 font-black text-2xl">=</div>

      <div className={`p-8 rounded-xl shadow-lg ${
        data.netProfit >= 0 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
          : 'bg-gradient-to-r from-red-600 to-rose-600'
      }`}>
        <div className="text-center">
          <p className="text-white/80 text-sm font-bold uppercase mb-2">
            {data.netProfit >= 0 ? '📈 Net Profit' : '📉 Net Loss'}
          </p>
          <p className="text-5xl font-black text-white">
            Rs. {Math.abs(data.netProfit).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Balance Sheet View Component
const BalanceSheetView = ({ data }) => {
  const totalLiabilitiesAndEquity = data.liabilities + data.equity;
  const balanced = Math.abs(data.assets - totalLiabilitiesAndEquity) < 0.01;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <p className="text-sm text-blue-800 font-bold">
          📊 Balance Sheet shows Assets, Liabilities, and Equity. 
          Assets = Liabilities + Equity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Assets */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 uppercase">Assets</h3>
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <div className="text-center">
              <p className="text-sm font-bold text-blue-600 mb-2">Total Assets</p>
              <p className="text-4xl font-black text-blue-900">
                Rs. {data.assets.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Liabilities + Equity */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 uppercase">Liabilities & Equity</h3>
          
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-rose-600">Liabilities</span>
              <span className="text-xl font-black text-rose-900">
                Rs. {data.liabilities.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center text-slate-400 font-black">+</div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-emerald-600">Equity</span>
              <span className="text-xl font-black text-emerald-900">
                Rs. {data.equity.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center text-slate-400 font-black">=</div>

          <div className="bg-slate-900 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white/80">Total</span>
              <span className="text-xl font-black text-white">
                Rs. {totalLiabilitiesAndEquity.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-xl text-center font-bold ${
        balanced 
          ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700' 
          : 'bg-red-50 border-2 border-red-200 text-red-700'
      }`}>
        {balanced ? '✓ Balance Sheet is balanced' : '⚠️ Balance Sheet is not balanced'}
      </div>
    </div>
  );
};

export default ReportModal;
import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import ReportModal from '../../components/ReportModal';
import IncomeModal from '../receptionist/modals/IncomeEntryModal';
import ExpenseModal from '../receptionist/modals/ExpenseEntryModal';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0
  });
  const [activeModal, setActiveModal] = useState(null);
  const [financialYear, setFinancialYear] = useState('2025/26');
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [financialYear]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/reports/income-statement?financialYear=${financialYear}`);
      const result = response.data?.data || {};

      setSummary({
        totalIncome: result.totalIncome || 0,
        totalExpense: result.totalExpense || 0,
        netProfit: result.netProfit || 0
      });
    } catch (err) {
      console.error("Error loading dashboard stats", err);
      setSummary({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'trial-balance', name: 'Trial Balance', icon: '⚖️', color: 'violet', implemented: true },
    { id: 'income-statement', name: 'Income Statement', icon: '📊', color: 'emerald', implemented: true },
    { id: 'balance-sheet', name: 'Balance Sheet', icon: '📈', color: 'blue', implemented: true },
    { id: 'sales-register', name: 'Sales Register', icon: '🛒', color: 'amber', implemented: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b-2 border-slate-200">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Financial Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Real-time insights from approved ledger transactions
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-200">
            <label className="text-sm font-semibold text-slate-700">Financial Year</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold 
                text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 
                focus:border-transparent"
            >
              <option value="2025/26">2025/26</option>
              <option value="2026/27">2026/27</option>
              <option value="2027/28">2027/28</option>
              <option value="2028/29">2028/29</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Total Income */}
          <div className="group bg-white rounded-2xl p-8 shadow-sm border-2 border-slate-200 
            hover:shadow-lg hover:bg-emerald-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Income
              </div>
            </div>

            <div className="text-4xl font-bold text-slate-900 mb-2">
              Rs. {summary.totalIncome.toLocaleString()}
            </div>

            <div className="text-sm text-slate-600">
              From approved entries
            </div>

            <div className="mt-6 h-1 bg-emerald-500 rounded-full" />
          </div>

          {/* Total Expenses */}
          <div className="group bg-white rounded-2xl p-8 shadow-sm border-2 border-slate-200 
            hover:shadow-lg  hover:bg-rose-300 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Expenses
              </div>

            </div>

            <div className="text-4xl font-bold text-slate-900 mb-2">
              Rs. {summary.totalExpense.toLocaleString()}
            </div>

            <div className="text-sm text-slate-600">
              From approved entries
            </div>

            <div className="mt-6 h-1 bg-rose-500 rounded-full" />
          </div>

          {/* Net Profit */}
          <div className={`group bg-white rounded-2xl p-8 shadow-sm border-2 transition-all duration-300
            ${summary.netProfit >= 0
              ? 'border-slate-200 hover:shadow-lg hover:bg-blue-300'
              : 'border-slate-200 hover:shadow-lg hover:bg-red-300'
            }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Net Profit
              </div>
            </div>

            <div className={`text-4xl font-bold mb-2 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
              Rs. {Math.abs(summary.netProfit).toLocaleString()}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${summary.netProfit >= 0
                ? 'bg-blue-100 text-blue-700'
                : 'bg-red-100 text-red-700'
                }`}>
                {summary.netProfit >= 0 ? 'Profit' : 'Loss'}
              </span>
              <span className="text-sm text-slate-600">FY {financialYear}</span>
            </div>

            <div className={`mt-6 h-1 rounded-full ${summary.netProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'
              }`} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal('INCOME')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm
              hover:bg-indigo-700 hover:shadow-md transition-all duration-200 
              active:scale-95 flex items-center gap-2"
          >

            <span>New Income</span>
          </button>

          <button
            onClick={() => setActiveModal('EXPENSE')}
            className="px-6 py-3 bg-rose-600 text-white rounded-xl font-semibold shadow-sm
              hover:bg-rose-700 hover:shadow-md transition-all duration-200 
              active:scale-95 flex items-center gap-2"
          >
            <span>New Expense</span>
          </button>
        </div>

        {/* Reports Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Financial Reports</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => report.implemented && setActiveReport(report.id)}
                disabled={!report.implemented}
                className={`group bg-white rounded-2xl p-6 text-left shadow-sm border-2 border-slate-200
                  transition-all duration-300
                  ${report.implemented
                    ? `hover:shadow-lg hover:border-${report.color}-300 hover:-translate-y-1 cursor-pointer`
                    : 'opacity-50 cursor-not-allowed'
                  }`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4
                  ${report.color === 'violet' && 'bg-violet-100 group-hover:bg-violet-200'}
                  ${report.color === 'emerald' && 'bg-emerald-100 group-hover:bg-emerald-200'}
                  ${report.color === 'blue' && 'bg-blue-100 group-hover:bg-blue-200'}
                  ${report.color === 'amber' && 'bg-amber-100 group-hover:bg-amber-200'}
                  ${report.implemented ? 'transition-colors duration-300' : ''}`}>
                  {report.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {report.name}
                </h3>

                {/* Status */}
                {report.implemented ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <span>View Report</span>
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </div>
                ) : (
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 
                    text-xs font-bold rounded-full">
                    Coming Soon
                  </span>
                )}

                {/* Bottom accent */}
                {report.implemented && (
                  <div className={`mt-4 h-1 rounded-full
                    ${report.color === 'violet' && 'bg-violet-500'}
                    ${report.color === 'emerald' && 'bg-emerald-500'}
                    ${report.color === 'blue' && 'bg-blue-500'}
                    ${report.color === 'amber' && 'bg-amber-500'}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-slate-800 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Quick Tips</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Click on any report card to view detailed financial statements. Use the financial year
                selector to analyze different periods. Export reports to CSV for further analysis in Excel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeReport && (
        <ReportModal
          reportType={activeReport}
          financialYear={financialYear}
          onClose={() => setActiveReport(null)}
        />
      )}

      {activeModal === 'INCOME' && (
        <IncomeModal
          onClose={() => setActiveModal(null)}
          refreshData={fetchStats}
        />
      )}

      {activeModal === 'EXPENSE' && (
        <ExpenseModal
          onClose={() => setActiveModal(null)}
          refreshData={fetchStats}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
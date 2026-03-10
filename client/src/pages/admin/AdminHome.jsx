import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import ReportModal from '../../components/ReportModal';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0
  });
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
      
      // Based on your reports.controller, the result is in response.data.data
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
    { id: 'trial-balance', name: 'Trial Balance', implemented: true },
    { id: 'income-statement', name: 'Income Statement', implemented: true },
    { id: 'balance-sheet', name: 'Balance Sheet', implemented: true },
    { id: 'sales-register', name: 'Sales Register', implemented: false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header with Financial Year Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Financial Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time stats from approved ledger entries</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 uppercase">Financial Year:</label>
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold 
              focus:border-blue-500 outline-none cursor-pointer"
          >
            <option value="2025/26">2025/26</option>
            <option value="2026/27">2026/27</option>
            <option value="2027/28">2027/28</option>
            <option value="2028/29">2028/29</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-emerald-500 
          hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Income</p>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-4xl font-black text-emerald-600 mt-2">
            Rs. {summary.totalIncome.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">From approved entries</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-rose-500 
          hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Expenses</p>
            <span className="text-2xl">💸</span>
          </div>
          <p className="text-4xl font-black text-rose-600 mt-2">
            Rs. {summary.totalExpense.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">From approved entries</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 
          hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Net Profit</p>
            <span className="text-2xl">{summary.netProfit >= 0 ? '📈' : '📉'}</span>
          </div>
          <p className={`text-4xl font-black mt-2 ${
            summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            Rs. {summary.netProfit.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {summary.netProfit >= 0 ? 'Profitable' : 'Loss'} • FY {financialYear}
          </p>
        </div>
      </div>

      {/* Quick Reports Section */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black">Quick Reports</h3>
            <span className="text-2xl">📑</span>
          </div>
          
          <div className="space-y-3">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => report.implemented && setActiveReport(report.id)}
                disabled={!report.implemented}
                className={`w-full text-left p-4 rounded-xl transition-all text-sm flex justify-between items-center
                  ${report.implemented 
                    ? 'bg-slate-800 hover:bg-slate-700 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' 
                    : 'bg-slate-800/50 cursor-not-allowed opacity-50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{report.icon}</span>
                  <div>
                    <span className="font-bold">{report.name}</span>
                    {!report.implemented && (
                      <span className="ml-2 text-[10px] px-2 py-0.5 bg-amber-500 text-amber-900 rounded-full font-black">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
                {report.implemented && (
                  <span className="text-blue-400 font-bold">View →</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-slate-800 rounded-xl">
            <p className="text-xs text-slate-400 font-bold">
              💡 Tip: Click any report to view detailed financial statements
            </p>
          </div>
        </div>
        
      </div>

      {/* Report Modal */}
      {activeReport && (
        <ReportModal
          reportType={activeReport}
          financialYear={financialYear}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
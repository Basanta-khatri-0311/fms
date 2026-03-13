import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axiosConfig';
import ReportModal from '../../components/ReportModal';
import IncomeModal from '../receptionist/modals/IncomeEntryModal';
import ExpenseModal from '../receptionist/modals/ExpenseEntryModal';
import PayrollModal from '../receptionist/modals/PayrollEntryModal';

import {
  Scale,
  LineChart,
  AreaChart,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Lightbulb
} from 'lucide-react';

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

  const user = JSON.parse(localStorage.getItem('user'));
  const isAuditor = user?.role === 'AUDITOR';

  const fetchStats = useCallback(async () => {
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
  }, [financialYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const reports = [
    { id: 'trial-balance', name: 'Trial Balance', icon: <Scale className="w-6 h-6" />, color: 'violet', implemented: true },
    { id: 'income-statement', name: 'Income Statement', icon: <LineChart className="w-6 h-6" />, color: 'emerald', implemented: true },
    { id: 'balance-sheet', name: 'Balance Sheet', icon: <AreaChart className="w-6 h-6" />, color: 'blue', implemented: true },
    { id: 'sales-register', name: 'Sales Register', icon: <ShoppingCart className="w-6 h-6" />, color: 'amber', implemented: true },
    { id: 'purchase-register', name: 'Purchase Register', icon: <ShoppingBag className="w-6 h-6" />, color: 'amber', implemented: true },
    { id: 'annex13', name: 'Annex 13', icon: <ClipboardList className="w-6 h-6" />, color: 'amber', implemented: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 tracking-tight">
              Financial Dashboard
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Real-time insights from approved ledger transactions
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-6 py-3.5 rounded-2xl shadow-sm border border-slate-200/60 ring-1 ring-black/5">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Financial Year</label>
            <div className="relative">
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="appearance-none bg-slate-100/50 border border-slate-300/60 pr-10 pl-4 py-2 rounded-xl text-sm font-bold 
                  text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 
                  focus:border-indigo-500 transition-all hover:bg-white"
              >
                <option value="2025/26">2025/26</option>
                <option value="2026/27">2026/27</option>
                <option value="2027/28">2027/28</option>
                <option value="2028/29">2028/29</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Total Income */}
          <div className="relative overflow-hidden group bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 
            hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transform group-hover:scale-110 transition-all duration-500">
              <LineChart className="w-32 h-32 text-emerald-600" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-100/50 rounded-xl text-emerald-600">
                  <LineChart className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Total Income
                </div>
              </div>

              <div>
                <div className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
                  <span className="text-2xl text-slate-400 font-medium mr-1">Rs.</span>
                  {summary.totalIncome.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  From approved entries
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
          </div>

          {/* Total Expenses */}
          <div className="relative overflow-hidden group bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 
            hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transform group-hover:scale-110 transition-all duration-500">
              <AreaChart className="w-32 h-32 text-rose-600" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-rose-100/50 rounded-xl text-rose-600">
                  <AreaChart className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Total Expenses
                </div>
              </div>

              <div>
                <div className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2">
                  <span className="text-2xl text-slate-400 font-medium mr-1">Rs.</span>
                  {summary.totalExpense.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  From approved entries
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-orange-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
          </div>

          {/* Net Profit */}
          <div className={`relative overflow-hidden group bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 
            hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${summary.netProfit >= 0 ? 'hover:shadow-blue-500/10' : 'hover:shadow-red-500/10'}`}>
            <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transform group-hover:scale-110 transition-all duration-500 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              <Scale className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl ${summary.netProfit >= 0 ? 'bg-blue-100/50 text-blue-600' : 'bg-red-100/50 text-red-600'}`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Net Profit
                </div>
              </div>

              <div>
                <div className={`text-4xl lg:text-5xl font-black tracking-tight mb-2 ${summary.netProfit >= 0 ? 'text-slate-900' : 'text-slate-900'}`}>
                  <span className="text-2xl text-slate-400 font-medium mr-1">Rs.</span>
                  {Math.abs(summary.netProfit).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide border ${summary.netProfit >= 0
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {summary.netProfit >= 0 ? 'Profit' : 'Loss'}
                  </span>
                  <span className="text-sm font-medium text-slate-500 ml-1">FY {financialYear}</span>
                </div>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1.5 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out ${summary.netProfit >= 0 ? 'bg-gradient-to-r from-blue-400 to-indigo-400' : 'bg-gradient-to-r from-red-400 to-rose-400'}`} />
          </div>
        </div>

        {/* Action Buttons */}
        {!isAuditor && (
          <div className="flex flex-wrap justify-end gap-4 pb-8 border-b border-slate-200/60">
            <button
              onClick={() => setActiveModal('INCOME')}
              className="group px-7 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25
                hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 
                active:scale-95 flex items-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl leading-none font-light mb-1">+</span> New Income
              </span>
            </button>

            <button
              onClick={() => setActiveModal('EXPENSE')}
              className="group px-7 py-3.5 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/25
                hover:bg-rose-500 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all duration-300 
                active:scale-95 flex items-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl leading-none font-light mb-1">+</span> New Expense
              </span>
            </button>
            {user?.permission?.canAccessPayroll &&(<button
              onClick={() => setActiveModal('PAYROLL')}
              className="group px-7 py-3.5 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/25
                hover:bg-teal-500 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 
                active:scale-95 flex items-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl leading-none font-light mb-1">+</span> New Payroll
              </span>
            </button>)}
          </div>
        )}

        {/* Reports Section */}
        <div>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Reports</h2>
              <p className="text-slate-500 mt-1 font-medium">Export and view tax & accounting reports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => report.implemented && setActiveReport(report.id)}
                disabled={!report.implemented}
                className={`group relative bg-white rounded-3xl p-6 text-left shadow-sm border border-slate-200/60 transition-all duration-400 overflow-hidden
                  ${report.implemented
                    ? `hover:shadow-xl hover:-translate-y-1 hover:border-${report.color}-300 cursor-pointer`
                    : 'opacity-60 cursor-not-allowed grayscale'
                  }`}
              >
                {/* Background decorative blob */}
                {report.implemented && (
                  <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 scale-150
                    ${report.color === 'violet' && 'bg-violet-600'}
                    ${report.color === 'emerald' && 'bg-emerald-600'}
                    ${report.color === 'blue' && 'bg-blue-600'}
                    ${report.color === 'amber' && 'bg-amber-600'}
                  `} />
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm border border-white/50
                  ${report.color === 'violet' && 'bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600 group-hover:from-violet-500 group-hover:to-violet-600 group-hover:text-white'}
                  ${report.color === 'emerald' && 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white'}
                  ${report.color === 'blue' && 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white'}
                  ${report.color === 'amber' && 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 group-hover:from-amber-500 group-hover:to-amber-600 group-hover:text-white'}
                  ${report.implemented ? 'transition-all duration-500 group-hover:shadow-md' : ''}`}>
                  {report.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                  {report.name}
                </h3>

                {/* Status */}
                {report.implemented ? (
                  <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors duration-300">
                    <span>View Report</span>
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300 text-lg leading-none">→</span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200
                      text-xs font-bold rounded-full uppercase tracking-wider">
                      Coming Soon
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="flex items-start gap-6 relative z-10">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 shrink-0 shadow-inner">
              <Lightbulb className="w-8 h-8 text-amber-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Quick Tips</h3>
              <p className="text-slate-300/90 text-base leading-relaxed max-w-3xl">
                Click on any report card to view detailed financial statements including Trial Balance, Sales/Purchase Registers, and Annex 13 VAT returns. Use the financial year
                selector to analyze different periods. Export reports to CSV for further analysis in Excel or submission to tax portals.
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

      {activeModal === 'PAYROLL' && (
        <PayrollModal
          onClose={() => setActiveModal(null)}
          refreshData={fetchStats}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
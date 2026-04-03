import React, { useState, useEffect, useCallback } from 'react';
import API from '../../api/axiosConfig';
import ReportModal from '../../components/ReportModal';
import IncomeModal from '../receptionist/modals/IncomeEntryModal';
import ExpenseModal from '../receptionist/modals/ExpenseEntryModal';
import PayrollModal from '../receptionist/modals/PayrollEntryModal';
import { useSystemSettings } from '../../context/SystemSettingsContext';

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
  const { settings, loading: settingsLoading } = useSystemSettings();
  const [financialYear, setFinancialYear] = useState(settings.fiscalYearBS || '');
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const isAuditor = user?.role === 'AUDITOR';
  const hasFinancialAccess = user?.role === 'SUPERADMIN' || user?.permissions?.canViewFinancialReports;
  const hasTaxationAccess = user?.role === 'SUPERADMIN' || user?.permissions?.canViewTaxationReports;

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
    if (settings.fiscalYearBS) {
      setFinancialYear(settings.fiscalYearBS);
    }
  }, [settings.fiscalYearBS]);

  useEffect(() => {
    if (financialYear) {
      fetchStats();
    }
  }, [financialYear, fetchStats]);

  const financialReports = [
    { id: 'income-report', name: 'Income Report', icon: <ShoppingBag className="w-5 h-5" />, color: 'emerald', implemented: true },
    { id: 'expense-report', name: 'Expense Report', icon: <ShoppingCart className="w-5 h-5" />, color: 'rose', implemented: true },
    { id: 'daily-cashbook', name: 'Daily Cashbook', icon: <ClipboardList className="w-5 h-5" />, color: 'blue', implemented: true },
    { id: 'ledger', name: 'Ledger', icon: <Scale className="w-5 h-5" />, color: 'indigo', implemented: true },
    { id: 'trial-balance', name: 'Trial Balance', icon: <Scale className="w-5 h-5" />, color: 'violet', implemented: true },
    { id: 'income-statement', name: 'Income Statement', icon: <LineChart className="w-5 h-5" />, color: 'emerald', implemented: true },
    { id: 'balance-sheet', name: 'Balance Sheet', icon: <AreaChart className="w-5 h-5" />, color: 'blue', implemented: true },
  ];

  const taxationReports = [
    { id: 'purchase-register', name: 'Purchase Register', icon: <ShoppingBag className="w-5 h-5" />, color: 'amber', implemented: true, subtitle: '(Khariid Khaataa)' },
    { id: 'sales-register', name: 'Sales Register', icon: <ShoppingCart className="w-5 h-5" />, color: 'amber', implemented: true, subtitle: '(Bikrii Khaataa)' },
    { id: 'annex13', name: 'Annex 13', icon: <ClipboardList className="w-5 h-5" />, color: 'amber', implemented: true },
    { id: 'tds-report', name: 'TDS Reports', icon: <Scale className="w-5 h-5" />, color: 'indigo', implemented: true },
  ];

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header Section */}
        <header className="relative bg-slate-900 rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-slate-900/10 overflow-hidden border border-slate-800">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3">
              <div className="inline-block px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-indigo-300 text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                Admin Dashboard
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-100 to-slate-400 tracking-tight leading-tight">
                {settings.systemName}
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-xl">
                Overview of your financial performance and verified records.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl px-5 py-4 rounded-3xl border border-white/10 shadow-2xl min-w-[250px]">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Active Fiscal Period</label>
                <div className="relative group">
                  <select
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value)}
                    className="appearance-none bg-transparent border-none pr-10 pl-0 py-1 text-xl font-black 
                      text-white cursor-pointer focus:outline-none transition-all hover:text-indigo-200"
                  >
                    {settings?.availableFiscalYears?.length > 0 ? (
                      settings.availableFiscalYears.map(year => (
                        <option key={year} className="bg-slate-900 text-white" value={year}>{year}</option>
                      ))
                    ) : (
                      <option className="bg-slate-900 text-white" value={financialYear}>{financialYear}</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-indigo-400 group-hover:text-white transition-colors">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Total Income */}
          <div className="relative overflow-hidden group bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-100/50 border border-slate-100 
            hover:shadow-3xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transform group-hover:scale-125 transition-all duration-700">
              <LineChart className="w-48 h-48 text-emerald-600" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-emerald-50">
                  <LineChart className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Total Income
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-400 mb-1">{settings.currencySymbol} Total Revenue</div>
                <div className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4">
                  {summary.totalIncome.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Confirmed Records</span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="relative overflow-hidden group bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-100/50 border border-slate-100 
            hover:shadow-3xl hover:shadow-rose-500/10 transition-all duration-500 hover:-translate-y-2 h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transform group-hover:scale-125 transition-all duration-700">
              <AreaChart className="w-48 h-48 text-rose-600" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shadow-rose-50">
                  <AreaChart className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                  Total Expenses
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-400 mb-1">{settings.currencySymbol} Total Spent</div>
                <div className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-4">
                  {summary.totalExpense.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Confirmed Payments</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="relative overflow-hidden group bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-100/50 border border-slate-100 
            hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col justify-between">
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transform group-hover:scale-125 transition-all duration-700 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              <Scale className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-4 mb-10">
                <div className={`p-3 rounded-2xl ${summary.netProfit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                  <Scale className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                   {summary.netProfit >= 0 ? 'Total Profit' : 'Total Loss'}
                </div>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-400 mb-1">{settings.currencySymbol} Final Balance</div>
                <div className={`text-5xl lg:text-6xl font-black tracking-tighter mb-4 text-slate-900`}>
                  {Math.abs(summary.netProfit).toLocaleString()}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border ${summary.netProfit >= 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                    {summary.netProfit >= 0 ? 'Profit Growth' : 'Deficit Alert'}
                  </span>
                </div>
              </div>
            </div>
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
            {(user?.role === 'SUPERADMIN' || user?.permissions?.canAccessPayroll) && <button
              onClick={() => setActiveModal('PAYROLL')}
              className="group px-7 py-3.5 bg-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/25
                hover:bg-teal-500 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300 
                active:scale-95 flex items-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl leading-none font-light mb-1">+</span> New Payroll
              </span>
            </button>}
          </div>
        )}

        {/* Reports Sections */}
        <div className="space-y-16">
          {/* Financial Reports */}
          {hasFinancialAccess && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Core Financial Reports</h2>
                  <p className="text-slate-500 font-medium">Accounting statements and operational summaries.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {financialReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => report.implemented && setActiveReport(report.id)}
                    disabled={!report.implemented}
                    className={`group relative bg-white rounded-4xl p-8 text-left shadow-2xl shadow-slate-100/50 border border-slate-100 transition-all duration-500 overflow-hidden h-full flex flex-col
                      ${report.implemented
                        ? `hover:shadow-3xl hover:-translate-y-2 cursor-pointer`
                        : 'opacity-60 cursor-not-allowed grayscale'
                      }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm border border-white/50 shrink-0
                      ${report.color === 'violet' && 'bg-linear-to-br from-violet-100 to-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'}
                      ${report.color === 'emerald' && 'bg-linear-to-br from-emerald-100 to-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'}
                      ${report.color === 'blue' && 'bg-linear-to-br from-blue-100 to-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}
                      ${report.color === 'indigo' && 'bg-linear-to-br from-indigo-100 to-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}
                      ${report.color === 'rose' && 'bg-linear-to-br from-rose-100 to-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'}
                      ${report.implemented ? 'transition-all duration-500 group-hover:shadow-lg shadow-slate-200' : ''}`}>
                      {report.icon}
                    </div>

                    <div className="space-y-1 mb-auto">
                      <h3 className="text-xl font-black text-slate-800 group-hover:text-slate-900 transition-colors leading-tight">
                        {report.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {report.implemented ? 'Production Ready' : 'Architecture Pending'}
                        </span>
                      </div>
                    </div>

                    {report.implemented && (
                      <div className="flex items-center gap-2 mt-8 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-500">
                        <span>Generate</span>
                        <span className="text-lg leading-none">→</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Taxation & Compliance */}
          {hasTaxationAccess && (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div className="w-2 h-8 bg-amber-500 rounded-full" />
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Taxation & Compliance</h2>
                  <p className="text-slate-500 font-medium">Government compliance and tax registry records.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {taxationReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => report.implemented && setActiveReport(report.id)}
                    disabled={!report.implemented}
                    className={`group relative bg-white rounded-4xl p-8 text-left shadow-2xl shadow-slate-100/50 border border-slate-100 transition-all duration-500 overflow-hidden h-full flex flex-col
                      ${report.implemented
                        ? `hover:shadow-3xl hover:-translate-y-2 cursor-pointer`
                        : 'opacity-60 cursor-not-allowed grayscale'
                      }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm border border-white/50 shrink-0
                      ${report.color === 'amber' && 'bg-linear-to-br from-amber-100 to-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'}
                      ${report.color === 'indigo' && 'bg-linear-to-br from-indigo-100 to-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}
                      ${report.implemented ? 'transition-all duration-500 group-hover:shadow-lg shadow-slate-200' : ''}`}>
                      {report.icon}
                    </div>

                    <div className="space-y-1 mb-auto">
                      <h3 className="text-xl font-black text-slate-800 group-hover:text-slate-900 transition-colors leading-tight">
                        {report.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-400 mb-1 transition-colors">{report.subtitle}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {report.implemented ? 'Production Ready' : 'Architecture Pending'}
                        </span>
                      </div>
                    </div>

                    {report.implemented && (
                      <div className="flex items-center gap-2 mt-8 text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform duration-500">
                        <span>Generate</span>
                        <span className="text-lg leading-none">→</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-10 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden">
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
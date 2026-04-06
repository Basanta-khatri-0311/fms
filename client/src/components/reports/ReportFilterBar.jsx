import React from 'react';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const ReportFilterBar = ({ filters, setFilters, reportType, accounts = [] }) => {
  const { settings } = useSystemSettings();
  
  return (
  <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
    <div>
      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Start Date</label>
      <input type="date" value={filters.startDate} onChange={(e) => setFilters(f => ({...f, startDate: e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-hidden focus:border-indigo-500 transition-colors" />
    </div>
    <div>
      <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">End Date</label>
      <input type="date" value={filters.endDate} onChange={(e) => setFilters(f => ({...f, endDate: e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-hidden focus:border-indigo-500 transition-colors" />
    </div>

    {['income-report', 'expense-report'].includes(reportType) && (
      <>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">Branch</label>
          <select value={filters.branch} onChange={(e) => setFilters(f => ({...f, branch: e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-hidden focus:border-indigo-500 transition-colors">
            <option value="All">All Branches</option>
            {settings?.branches?.filter(b => b.active).map(b => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">
            {reportType === 'income-report' ? 'Service Type' : 'Category'}
          </label>
          {reportType === 'income-report' ? (
            <select value={filters.category} onChange={(e) => setFilters(f => ({...f, category: e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-hidden focus:border-indigo-500 transition-colors">
              <option value="All">All</option>
              <option value="IELTS">IELTS</option>
              <option value="PTE">PTE</option>
              <option value="Consulting">Consulting</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <select value={filters.category} onChange={(e) => setFilters(f => ({...f, category: e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-hidden focus:border-indigo-500 transition-colors">
              <option value="All">All</option>
              <option value="Salary">Salary (Payroll)</option>
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Stationary">Stationary</option>
              <option value="General Expense">General Expense</option>
            </select>
          )}
        </div>
      </>
    )}

    {['daily-cashbook', 'ledger'].includes(reportType) && (
      <div>
        <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1.5">
          {reportType === 'daily-cashbook' ? 'Cash/Bank Account' : 'Ledger Account'}
        </label>
        <select value={filters.accountId} onChange={(e) => setFilters(f => ({...f, accountId: e.target.value}))} className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-hidden focus:border-indigo-500 transition-colors min-w-[200px]">
          <option value="All" disabled>{reportType === 'daily-cashbook' ? 'Select Cash/Bank' : 'Select Account'}</option>
          {accounts.filter(a => reportType === 'ledger' || ['CASH', 'BANK'].some(t => a.code.includes(t) || a.name.toUpperCase().includes(t))).map(acc => (
             <option key={acc._id} value={acc._id}>{acc.name} ({acc.code})</option>
          ))}
        </select>
      </div>
    )}
  </div>
  );
};

export default ReportFilterBar;

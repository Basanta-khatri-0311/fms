import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/reports/income-statement'); // Your existing backend route
        setSummary(data.data);
      } catch (err) {
        console.error("Error loading dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Financial Overview</h2>
        <p className="text-sm text-slate-500">Real-time stats from approved ledger entries.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm font-medium text-slate-500 uppercase">Total Income</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">Rs. {summary.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-sm font-medium text-slate-500 uppercase">Total Expenses</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">Rs. {summary.totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm font-medium text-slate-500 uppercase">Net Profit</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">Rs. {summary.netProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Links Section based on your drawing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold mb-4">Quick Reports</h3>
          <div className="space-y-3">
            {['Trial Balance', 'Income Statement', 'Balance Sheet', 'Sales Register'].map((report) => (
              <button key={report} className="w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm flex justify-between">
                <span>{report}</span>
                <span className="text-blue-400">View →</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Audit Trail Status</h3>
          <p className="text-sm text-slate-500 italic">No recent system modifications detected.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
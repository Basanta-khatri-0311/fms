import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';

const COAManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/coa');
      setAccounts(data.data || data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load chart of accounts');
    } finally {
      setLoading(false);
    }
  };

  const accountTypes = ['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'];
  
  const filteredAccounts = filterType === 'ALL' 
    ? accounts 
    : accounts.filter(a => a.type === filterType);

  const getTypeIcon = (type) => {
    const icons = {
      'ASSET': '💰',
      'LIABILITY': '💳',
      'EQUITY': '📊',
      'INCOME': '💵',
      'EXPENSE': '💸',
    };
    return icons[type] || '📄';
  };

  const getTypeColor = (type) => {
    const colors = {
      'ASSET': 'blue',
      'LIABILITY': 'red',
      'EQUITY': 'purple',
      'INCOME': 'emerald',
      'EXPENSE': 'rose',
    };
    return colors[type] || 'slate';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="text-red-600 font-bold mt-2">{error}</p>
          <button
            onClick={fetchAccounts}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Chart of Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your accounting structure</p>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
          ➕ Add Account
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {accountTypes.map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
              filterType === type
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {accountTypes.slice(1).map(type => {
          const count = accounts.filter(a => a.type === type).length;
          const color = getTypeColor(type);
          return (
            <div key={type} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getTypeIcon(type)}</span>
                <p className={`text-xs font-black uppercase text-${color}-400`}>
                  {type}
                </p>
              </div>
              <h3 className="text-2xl font-black text-slate-900">{count}</h3>
            </div>
          );
        })}
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                  Account Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((account) => {
                const color = getTypeColor(account.type);
                return (
                  <tr key={account._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-slate-600">
                        {account.code || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getTypeIcon(account.type)}</span>
                        <span className="font-bold text-slate-800">{account.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase bg-${color}-100 text-${color}-600`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {account.description || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAccounts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <span className="text-6xl">📊</span>
          <p className="text-slate-500 font-bold mt-4">
            {filterType === 'ALL' 
              ? 'No accounts found. Click "Add Account" to create your first account.' 
              : `No ${filterType} accounts found.`
            }
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-sm font-black text-blue-900 mb-2">💡 About Chart of Accounts</h3>
        <p className="text-sm text-blue-800">
          The Chart of Accounts is the foundation of your accounting system. Each account represents 
          a category where transactions are recorded. Accounts are organized by type: Assets (what you own), 
          Liabilities (what you owe), Equity (owner's stake), Income (revenue), and Expenses (costs).
        </p>
      </div>
    </div>
  );
};

export default COAManagement;
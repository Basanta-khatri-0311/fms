import { useState, useEffect, useMemo } from 'react';
import API from '../api/axiosConfig';

// Shared logic hook for TransactionStatus
const useTransactions = ({ mode = 'ALL', onRefresh }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      const requests = [];
      const needIncome = ['ALL', 'PENDING', 'INCOME', 'ADVANCE', 'DUE'].includes(mode);
      const needExpense = ['ALL', 'PENDING', 'EXPENSE', 'ADVANCE', 'DUE'].includes(mode);

      if (needIncome) requests.push(API.get('/incomes'));
      if (needExpense) requests.push(API.get('/expenses'));

      const responses = await Promise.all(requests);
      let combined = [];

      const getData = (res) => (Array.isArray(res?.data?.data) ? res.data.data : res?.data || []);

      if (needIncome) {
        const incData = getData(responses[0]);
        combined = [
          ...combined,
          ...incData.map((item) => ({
            ...item,
            type: 'INCOME',
            displayName: item.name,
          })),
        ];
      }

      if (needExpense) {
        const expRes = needIncome ? responses[1] : responses[0];
        const expData = getData(expRes);

        combined = [
          ...combined,
          ...expData.map((item) => ({
            ...item,
            type: 'EXPENSE',
            displayName: item.vendor?.name || 'Unknown Vendor',
          })),
        ];
      }

      setEntries(combined);

    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(err.response?.data?.message || 'Failed to load transactions. Please try again.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [mode]);

  // Listen for global transaction-change events so external creates/edits
  // (e.g. from Approver dashboard modals) can trigger a refetch.
  useEffect(() => {
    const handler = () => {
      fetchEntries();
    };

    window.addEventListener('transactions:changed', handler);
    return () => window.removeEventListener('transactions:changed', handler);
  }, [mode]);

  const filteredData = useMemo(() => {
    return entries.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const name = item.displayName?.toLowerCase() || '';
        if (!name.includes(search)) return false;
      }

      if (dateRange.start || dateRange.end) {
        const itemDate = new Date(item.createdAt);
        if (dateRange.start && itemDate < new Date(dateRange.start)) return false;
        if (dateRange.end) {
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
      }

      const net = item.type === 'INCOME' ? item.netAmount || 0 : item.netPayable || 0;
      const paid = item.type === 'INCOME' ? item.amountReceived || 0 : item.amountPaid || 0;

      if (mode === 'PENDING' && item.status !== 'PENDING') return false;
      if (mode === 'INCOME' && item.type !== 'INCOME') return false;
      if (mode === 'EXPENSE' && item.type !== 'EXPENSE') return false;
      if (mode === 'ADVANCE' && paid - net <= 0.01) return false;
      if (mode === 'DUE' && net - paid <= 0.01) return false;

      return true;
    });
  }, [entries, statusFilter, typeFilter, searchTerm, dateRange, mode]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchTerm, dateRange, mode]);

  const handleAction = async (id, action, type) => {
    if (!window.confirm(`Are you sure you want to ${action.toLowerCase()} this entry?`)) return;

    setActionLoading(id);
    try {
      const endpoint = type === 'INCOME' ? `/incomes/${id}/status` : `/expenses/${id}/status`;
      await API.patch(endpoint, { status: action });

      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 ${action === 'APPROVED' ? 'bg-emerald-500' : 'bg-orange-500'
        } text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-bold`;
      notification.textContent = `Entry ${action.toLowerCase()} successfully!`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      await fetchEntries();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  return {
    // state
    loading,
    error,
    actionLoading,
    statusFilter,
    typeFilter,
    searchTerm,
    dateRange,
    currentPage,
    itemsPerPage,
    filteredData,
    paginatedData,
    totalPages,

    setStatusFilter,
    setTypeFilter,
    setSearchTerm,
    setDateRange,
    setItemsPerPage,
    setCurrentPage,
    handleAction,
    clearFilters,
    refetch: fetchEntries,
  };
};

export default useTransactions;


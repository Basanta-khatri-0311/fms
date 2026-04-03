import { useState, useEffect, useMemo, useCallback } from 'react';
import API from '../api/axiosConfig';
import { showNotification } from '../utils/toast';

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

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requests = [];
      const needIncome = ['ALL', 'PENDING', 'INCOME', 'ADVANCE', 'DUE'].includes(mode);
      const needExpense = ['ALL', 'PENDING', 'EXPENSE', 'ADVANCE', 'DUE'].includes(mode);
      const needPayroll = ['ALL', 'PENDING', 'PAYROLL', 'ADVANCE', 'DUE'].includes(mode);

      if (needIncome) requests.push(API.get('/incomes'));
      if (needExpense) requests.push(API.get('/expenses'));
      if (needPayroll) requests.push(API.get('/payroll'));

      const responses = await Promise.all(requests);
      let combined = [];

      const getData = (res) => (Array.isArray(res?.data?.data) ? res.data.data : res?.data || []);

      let responseIndex = 0;

      if (needIncome) {
        const incData = getData(responses[responseIndex++]);
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
        const expData = getData(responses[responseIndex++]);
        combined = [
          ...combined,
          ...expData.map((item) => ({
            ...item,
            type: 'EXPENSE',
            displayName: item.vendor?.name || 'Unknown Vendor',
          })),
        ];
      }
      
      if (needPayroll) {
        const payData = getData(responses[responseIndex++]);
        combined = [
          ...combined,
          ...payData.map((item) => ({
            ...item,
            type: 'PAYROLL',
            displayName: item.employeeName,
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
  }, [mode]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Listen for global transaction-change events so external creates/edits
  // (from Approver dashboard modals) can trigger a refetch.
  useEffect(() => {
    const handler = () => {
      fetchEntries();
    };

    window.addEventListener('transactions:changed', handler);
    return () => window.removeEventListener('transactions:changed', handler);
  }, [fetchEntries]);

  const filteredData = useMemo(() => {
    return entries.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const name = item.displayName?.toLowerCase() || '';
        const invoiceNumber = item.invoiceNumber?.toLowerCase() || '';
        const billNumber = item.billNumber?.toLowerCase() || '';

        if (!name.includes(search) && !invoiceNumber.includes(search) && !billNumber.includes(search)) {
          return false;
        }
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

      const isAdvance = (item.advanceAmount || 0) > 0.01;
      const isDue = (item.pendingAmount || 0) > 0.01;

      if (mode === 'PENDING' && item.status !== 'PENDING') return false;
      if (mode === 'INCOME' && item.type !== 'INCOME') return false;
      if (mode === 'EXPENSE' && item.type !== 'EXPENSE') return false;
      if (mode === 'PAYROLL' && item.type !== 'PAYROLL') return false;
      if (mode === 'ADVANCE' && !isAdvance) return false;
      if (mode === 'DUE' && !isDue) return false;

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

  const [pendingAction, setPendingAction] = useState(null); // { id, action, type }

  const handleAction = async (id, action, type) => {
    // Instead of native window prompt/confirm, we just queue the action
    setPendingAction({ id, action, type });
  };

  const executeAction = async (rejectionReason = null) => {
    if (!pendingAction) return;
    const { id, action, type } = pendingAction;

    if (action === 'REJECTED' && !rejectionReason) {
      // Validated by the UI modal
      return;
    }

    setActionLoading(id);
    try {
      const endpoint = `/approvals/${id}`;
      await API.patch(endpoint, { type, action, rejectionReason });

      showNotification('success', `Entry ${action.toLowerCase()} successfully!`);

      await fetchEntries();
      if (onRefresh) onRefresh();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(null);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setPendingAction(null);
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
    executeAction,
    cancelAction,
    pendingAction,
    clearFilters,
    refetch: fetchEntries,
  };
};

export default useTransactions;


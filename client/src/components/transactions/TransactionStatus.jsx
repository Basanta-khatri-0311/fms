import React from 'react';
import useTransactions from '../../hooks/useTransactions';
import TransactionHeader from './TransactionHeader';
import TransactionFilters from './TransactionFilters';
import TransactionTabs from './TransactionTabs';
import TransactionTableDesktop from './TransactionTableDesktop';
import TransactionCardsMobile from './TransactionCardsMobile';
import TransactionPagination from './TransactionPagination';

const TransactionStatus = ({ onRefresh, mode = 'ALL' }) => {
  const {
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
  } = useTransactions({ mode, onRefresh });

  const user = JSON.parse(localStorage.getItem('user'));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 p-4">
        <div className="text-6xl">⚠️</div>
        <p className="text-rose-600 font-bold text-lg text-center">{error}</p>
      
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  const hasActiveFilters =
    !!searchTerm || !!dateRange.start || !!dateRange.end || statusFilter !== 'ALL' || typeFilter !== 'ALL';

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-full overflow-hidden">
      <TransactionHeader mode={mode} total={filteredData.length} />

      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateChange={setDateRange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <TransactionTabs
        mode={mode}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      <TransactionTableDesktop
        rows={paginatedData}
        user={user}
        onAction={handleAction}
        actionLoading={actionLoading}
      />

      <TransactionCardsMobile
        rows={paginatedData}
        user={user}
        onAction={handleAction}
        actionLoading={actionLoading}
      />

      <TransactionPagination
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default TransactionStatus;


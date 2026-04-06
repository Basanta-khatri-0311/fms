import React, { useState, useEffect } from 'react';
import API from '../api/axiosConfig';
import { numberToWords } from '../utils/numberToWords';

// Split Views
import TrialBalanceView from './reports/TrialBalanceView';
import IncomeStatementView from './reports/IncomeStatementView';
import BalanceSheetView from './reports/BalanceSheetView';
import SalesRegisterView from './reports/SalesRegisterView';
import PurchaseRegisterView from './reports/PurchaseRegisterView';
import Annex13View from './reports/Annex13View';
import IncomeReportView from './reports/IncomeReportView';
import ExpenseReportView from './reports/ExpenseReportView';
import LedgerView from './reports/LedgerView';
import TDSRegisterView from './reports/TDSRegisterView';

const ReportModal = ({ reportType, financialYear, branch: initialBranch = 'All', onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    branch: initialBranch,
    category: 'All',
    accountId: 'All',
  });

  const fetchReportData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let params = new URLSearchParams({ financialYear });
      if (['income-report', 'expense-report'].includes(reportType)) {
         if (filters.startDate) params.append('startDate', filters.startDate);
         if (filters.endDate) params.append('endDate', filters.endDate);
         if (filters.branch && filters.branch !== 'All') params.append('branch', filters.branch);
         if (filters.category && filters.category !== 'All') {
            if (reportType === 'income-report') params.append('serviceType', filters.category);
            else params.append('category', filters.category);
         }
      } else if (['daily-cashbook', 'ledger'].includes(reportType)) {
         if (filters.startDate) params.append('startDate', filters.startDate);
         if (filters.endDate) params.append('endDate', filters.endDate);
         if (filters.accountId && filters.accountId !== 'All') params.append('accountId', filters.accountId);
         if (filters.branch && filters.branch !== 'All') params.append('branch', filters.branch);
      } else {
        // Global Reports (Trial Balance, Income Stmt, etc.)
        if (filters.branch && filters.branch !== 'All') params.append('branch', filters.branch);
      }
      const endpoint = `/reports/${reportType}?${params.toString()}`;
      const response = await API.get(endpoint);
      setData(response.data.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportType, financialYear, filters]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  useEffect(() => {
    if (['daily-cashbook', 'ledger'].includes(reportType)) {
       API.get('/reports/accounts').then(res => {
         setAccounts(res.data.data);
         if (reportType === 'daily-cashbook') {
            const cashAcc = res.data.data.find(a => a.code === 'CASH');
            if (cashAcc) setFilters(f => ({...f, accountId: cashAcc._id}));
         }
       }).catch(console.error);
    }
  }, [reportType]);

  const exportToCSV = () => {
    if (!data) return;

    let csvContent = '';
    let filename = '';

    if (reportType === 'trial-balance') {
      filename = `trial-balance-${financialYear}.csv`;
      csvContent = 'Account Type,Account Name,Debit,Credit,Balance\n';
      
      data.groups.forEach(group => {
        csvContent += `\n${group.groupLabel}\n`;
        group.accounts.forEach(acc => {
          csvContent += `,"${acc.accountName}",${acc.debitTotal},${acc.creditTotal},${acc.balance}\n`;
        });
        csvContent += `,Subtotal,${group.subtotalDebit},${group.subtotalCredit},${group.subtotalBalance}\n`;
      });
      csvContent += `\nGRAND TOTAL,,${data.grandTotalDebit},${data.grandTotalCredit}\n`;
      
    } else if (reportType === 'income-statement') {
      filename = `income-statement-${financialYear}.csv`;
      csvContent = 'Category,Account,Amount\n';
      csvContent += '\nREVENUE\n';
      data.revenue.breakdown.forEach(acc => {
        csvContent += `,"${acc.name}",${acc.amount}\n`;
      });
      csvContent += `,Total Revenue,${data.revenue.total}\n`;
      csvContent += '\nEXPENSES\n';
      data.expenses.breakdown.forEach(acc => {
        csvContent += `,"${acc.name}",${acc.amount}\n`;
      });
      csvContent += `,Total Expenses,${data.expenses.total}\n`;
      csvContent += `\nNET PROFIT,,${data.netProfit}\n`;
      
    } else if (reportType === 'balance-sheet') {
      filename = `balance-sheet-${financialYear}.csv`;
      csvContent = 'Category,Account,Amount\n';
      csvContent += '\nASSETS\n';
      csvContent += 'Current Assets\n';
      data.assets.current.accounts.forEach(acc => {
        csvContent += `,"${acc.name}",${acc.balance}\n`;
      });
      csvContent += `,Total Current Assets,${data.assets.current.total}\n`;
      csvContent += '\nFixed Assets\n';
      data.assets.fixed.accounts.forEach(acc => {
        csvContent += `,"${acc.name}",${acc.balance}\n`;
      });
      csvContent += `,Total Fixed Assets,${data.assets.fixed.total}\n`;
      csvContent += `,TOTAL ASSETS,${data.assets.total}\n`;
    } else if (reportType === 'sales-register') {
      filename = `sales-register-${financialYear}.csv`;
      csvContent = 'Date,Invoice Number,Buyer Name,Buyer PAN,Service Type,Amount Before VAT,Discount,VAT Amount,TDS Amount,Net Amount\n';
      data.sales.forEach(sale => {
        csvContent += `"${new Date(sale.date).toLocaleDateString()}","${sale.invoiceNumber}","${sale.buyerName}","${sale.buyerPan}","${sale.serviceType}",${sale.amountBeforeVAT},${sale.discount},${sale.vatAmount},${sale.tdsAmount},${sale.netAmount}\n`;
      });
      csvContent += `\nTOTAL,,,,,${data.totals.amountBeforeVAT},${data.totals.discount},${data.totals.vatAmount},${data.totals.tdsAmount},${data.totals.netAmount}\n`;
    } else if (reportType === 'purchase-register') {
      filename = `purchase-register-${financialYear}.csv`;
      csvContent = 'Date,Bill Number,Vendor Name,Vendor PAN,Amount Before VAT,Discount,VAT Amount,TDS Amount,Net Payable\n';
      data.purchases.forEach(purchase => {
        csvContent += `"${new Date(purchase.date).toLocaleDateString()}","${purchase.billNumber}","${purchase.vendorName}","${purchase.vendorPan}",${purchase.amountBeforeVAT},${purchase.discount},${purchase.vatAmount},${purchase.tdsAmount},${purchase.netPayable}\n`;
      });
      csvContent += `\nTOTAL,,,,${data.totals.amountBeforeVAT},${data.totals.discount},${data.totals.vatAmount},${data.totals.tdsAmount},${data.totals.netPayable}\n`;
    } else if (reportType === 'annex13') {
      filename = `annex13-${financialYear}.csv`;
      csvContent = 'Category,Amount Before VAT,Discount,VAT Amount,TDS Amount,Net Amount\n';
      csvContent += `SALES,${data.sales.amountBeforeVAT},${data.sales.discount},${data.sales.vatAmount},${data.sales.tdsAmount},${data.sales.netAmount}\n`;
      csvContent += `PURCHASES,${data.purchases.amountBeforeVAT},${data.purchases.discount},${data.purchases.vatAmount},${data.purchases.tdsAmount},${data.purchases.netPayable}\n`;
      csvContent += `\nSUMMARY\n`;
      csvContent += `Total VAT Collected (Sales),${data.summary.totalVatPayable}\n`;
      csvContent += `Total VAT Paid (Purchases),${data.summary.totalVatClaimable}\n`;
      csvContent += `Net VAT Due,${data.summary.netVatDue}\n`;
    } else if (reportType === 'tds-report') {
      filename = `tds-report-${financialYear}.csv`;
      csvContent = 'Date,Source,Party Name,Party PAN,Bill No,Base Amount,Type,TDS Amount\n';
      data.tdsData.forEach(item => {
        csvContent += `"${new Date(item.date).toLocaleDateString()}","${item.source}","${item.partyName}","${item.partyPan}","${item.billNumber}",${item.baseAmount},${item.type === 'TDS_PAYABLE' ? 'Payable' : 'Receivable'},${item.tdsAmount}\n`;
      });
      csvContent += `\nSUMMARY\n`;
      csvContent += `Total TDS Payable,${data.totals.totalTDSPayable}\n`;
      csvContent += `Total TDS Receivable,${data.totals.totalTDSReceivable}\n`;
    } else if (reportType === 'income-report') {
      filename = `income-report-${financialYear}.csv`;
      csvContent = 'Bill Date,Bill No,Party Name,Address,Contact Number,Branch,Service Type,Amount Before VAT,VAT,Amount After VAT\n';
      data.data.forEach(item => {
         csvContent += `"${new Date(item.billDate).toLocaleDateString()}","${item.billNumber}","${item.partyName}","${item.address}","${item.contactNumber}","${item.branch}","${item.serviceType}",${item.amountBeforeVAT},${item.vatAmount},${item.amountAfterVAT}\n`;
      });
      csvContent += `\nTOTAL,,,,,,,${data.totals.amountBeforeVAT},${data.totals.vatAmount},${data.totals.amountAfterVAT}\n`;
      csvContent += `\nTotal Amount Received in words: "${numberToWords(data.totals.amountAfterVAT).toUpperCase()}"\n`;
    } else if (reportType === 'expense-report') {
      filename = `expense-report-${financialYear}.csv`;
      csvContent = 'Bill Date,Bill No,Purchased From,Payment Category,Branch,TDS Amount,Total Amount Paid\n';
      data.data.forEach(item => {
         csvContent += `"${new Date(item.billDate).toLocaleDateString()}","${item.billNumber}","${item.purchasedFrom}","${item.paymentCategory}","${item.branch}",${item.tdsAmount},${item.totalAmountPaid}\n`;
      });
      csvContent += `\nTOTAL,,,,,${data.totals.tdsAmount},${data.totals.totalAmountPaid}\n`;
      
      csvContent += `\n\nGROUP-WISE SUMMARY\nCategory,Total\n`;
      data.groupSummary.forEach(g => {
         csvContent += `"${g.category}",${g.total}\n`;
      });
    } else if (['daily-cashbook', 'ledger'].includes(reportType)) {
      filename = `${reportType}-${financialYear}.csv`;
      csvContent = 'Date,Transaction ID,Particulars,Debit,Credit,Balance\n';
      csvContent += `,,OPENING BALANCE,,,${data.openingBalance}\n`;
      data.data.forEach(item => {
         csvContent += `"${new Date(item.date).toLocaleDateString()}","${item.transactionId}","${item.particulars}",${item.debit},${item.credit},${item.balance}\n`;
      });
      csvContent += `,,CLOSING BALANCE,,,${data.closingBalance}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <span className="text-6xl">⚠️</span>
          <p className="text-rose-600 font-bold text-lg">{error}</p>
          <button
            onClick={fetchReportData}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold 
              hover:bg-indigo-700 transition-all shadow-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="text-6xl">📭</span>
          <p className="text-slate-500 font-semibold mt-4">No data available for this period</p>
        </div>
      );
    }

    if (reportType === 'trial-balance') {
      return <TrialBalanceView data={data} financialYear={financialYear} />;
    } else if (reportType === 'income-statement') {
      return <IncomeStatementView data={data} financialYear={financialYear} />;
    } else if (reportType === 'balance-sheet') {
      return <BalanceSheetView data={data} financialYear={financialYear} />;
    } else if (reportType === 'sales-register') {
      return <SalesRegisterView data={data} financialYear={financialYear} />;
    } else if (reportType === 'purchase-register') {
      return <PurchaseRegisterView data={data} financialYear={financialYear} />;
    } else if (reportType === 'annex13') {
      return <Annex13View data={data} financialYear={financialYear} />;
    } else if (reportType === 'tds-report') {
      return <TDSRegisterView data={data} financialYear={financialYear} />;
    } else if (reportType === 'income-report') {
      return <IncomeReportView data={data} financialYear={financialYear} filters={filters} setFilters={setFilters} />;
    } else if (reportType === 'expense-report') {
      return <ExpenseReportView data={data} financialYear={financialYear} filters={filters} setFilters={setFilters} />;
    } else if (reportType === 'daily-cashbook') {
      return <LedgerView data={data} financialYear={financialYear} filters={filters} setFilters={setFilters} accounts={accounts} reportType={reportType} />;
    } else if (reportType === 'ledger') {
      return <LedgerView data={data} financialYear={financialYear} filters={filters} setFilters={setFilters} accounts={accounts} reportType={reportType} />;
    }

    return null;
  };

  const getReportTitle = () => {
    const titles = {
      'trial-balance': 'Trial Balance',
      'income-statement': 'Income Statement',
      'balance-sheet': 'Balance Sheet',
      'sales-register': 'Sales Register',
      'purchase-register': 'Purchase Register',
      'annex13': 'Annex 13 (VAT Return)',
      'tds-report': 'TDS Register',
      'income-report': 'Income Report',
      'expense-report': 'Expense Report',
      'daily-cashbook': 'Daily Cashbook',
      'ledger': 'General Ledger',
    };
    return titles[reportType] || 'Financial Report';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative px-10 pt-10 pb-8 bg-slate-50/50 shrink-0">
          <button 
            onClick={onClose}
            className="absolute right-8 top-8 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm z-10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{getReportTitle()}</h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                Analytical period: <span className="font-bold text-slate-900">FY {financialYear}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 flex flex-col">
          {renderReportContent()}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row 
          justify-between items-center gap-4 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={loading || error || !data}
              className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold
                hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-emerald-200 active:scale-95 uppercase tracking-widest text-xs"
            >
              Export Report
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3.5 bg-white text-slate-500 rounded-2xl font-bold 
                hover:text-slate-700 hover:bg-slate-50 border border-slate-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardSwitcher from './pages/DashboardSwitcher';
import Unauthorized from './pages/Unauthorized';

// Shared transaction views
import TransactionStatusPage from './components/transactions/TransactionStatus';

// Approver views
import IncomeRecords from './pages/approver/IncomeRecords';
import ExpenseRecords from './pages/approver/ExpenseRecords';
import AdvanceRecords from './pages/approver/AdvanceRecords';
import DueRecords from './pages/approver/DueRecords';

// Admin / Superadmin views
import AdminHome from './pages/admin/AdminHome';

// placeholder pages for navigation targets for checking
const UsersPage = () => <div className="p-6">User management screen (to be implemented).</div>;
const ReportsPage = () => <AdminHome />;
const CoaSetupPage = () => <div className="p-6">COA setup screen (to be implemented).</div>;

// Auditor views
const LedgerAuditPage = () => <div className="p-6">Ledger audit view (to be implemented).</div>;
const TaxReportsPage = () => <div className="p-6">Tax registers & Annex 13 (to be implemented).</div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized/>} />

        <Route element={<MainLayout />}>
          {/* Role-based dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['RECEPTIONIST', 'APPROVER', 'SUPERADMIN', 'AUDITOR']}>
                <DashboardSwitcher />
              </ProtectedRoute>
            }
          />

          {/* Receptionist / Approver own submissions */}
          <Route
            path="/submissions"
            element={
              <ProtectedRoute allowedRoles={['RECEPTIONIST', 'APPROVER']}>
                <TransactionStatusPage />
              </ProtectedRoute>
            }
          />

          {/* Approver: record views */}
          <Route
            path="/income"
            element={
              <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
                <IncomeRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expense"
            element={
              <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
                <ExpenseRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/advance"
            element={
              <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
                <AdvanceRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/due"
            element={
              <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
                <DueRecords />
              </ProtectedRoute>
            }
          />

          {/* Superadmin-only management screens */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'AUDITOR']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coa"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <CoaSetupPage />
              </ProtectedRoute>
            }
          />

          {/* Auditor-focused routes */}
          <Route
            path="/ledger"
            element={
              <ProtectedRoute allowedRoles={['AUDITOR', 'SUPERADMIN']}>
                <LedgerAuditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tax-reports"
            element={
              <ProtectedRoute allowedRoles={['AUDITOR', 'SUPERADMIN']}>
                <TaxReportsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App
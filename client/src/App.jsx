import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import MainLayout from './layouts/MainLayout';
import TransactionStatus from './components/transactions/TransactionStatus';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardSwitcher from './pages/DashboardSwitcher';
import Unauthorized from './pages/Unauthorized';

// Admin pages
import AdminDashboard from './pages/admin/AdminHome';
import UserManagement from './pages/admin/UserManagement';
import COAManagement from './pages/admin/CoaManagement';
import AuditorView from './pages/auditor/AuditorView';

// Wrapper components for different modes
const IncomeRecords = () => <TransactionStatus mode="INCOME" />;
const ExpenseRecords = () => <TransactionStatus mode="EXPENSE" />;
const AdvanceRecords = () => <TransactionStatus mode="ADVANCE" />;
const DueRecords = () => <TransactionStatus mode="DUE" />;
const MySubmissions = () => <TransactionStatus mode="ALL" />;
const PayrollRecords = () => <TransactionStatus mode="PAYROLL" />;

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          
          {/* Dashboard - All roles */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'APPROVER', 'SUPERADMIN', 'AUDITOR']}>
              <DashboardSwitcher />
            </ProtectedRoute>
          } />

          {/* RECEPTIONIST Routes */}
          <Route path="/submissions" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
              <MySubmissions />
            </ProtectedRoute>
          } />

          {/* APPROVER Routes */}
          <Route path="/income" element={
            <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
              <IncomeRecords />
            </ProtectedRoute>
          } />

          <Route path="/expense" element={
            <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
              <ExpenseRecords />
            </ProtectedRoute>
          } />

          <Route path="/payroll" element={
            <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
              <PayrollRecords />
            </ProtectedRoute>
          } />

          <Route path="/advance" element={
            <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
              <AdvanceRecords />
            </ProtectedRoute>
          } />

          <Route path="/due" element={
            <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
              <DueRecords />
            </ProtectedRoute>
          } />

          {/* SUPERADMIN Routes */}
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['SUPERADMIN', 'AUDITOR', 'APPROVER']} requiredPermission="canViewReports">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/coa" element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <COAManagement />
            </ProtectedRoute>
          } />

          {/* AUDITOR Routes */}

          <Route path="/audit-log" element={
            <ProtectedRoute allowedRoles={['AUDITOR', 'SUPERADMIN']}>
              <AuditorView />
            </ProtectedRoute>
          } />
          
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
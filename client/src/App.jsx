import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import MainLayout from './layouts/MainLayout';
import IncomeStatus from './pages/receptionist/TransactionTable';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardSwitcher from './pages/DashboardSwitcher'
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized/>} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'APPROVER', 'SUPERADMIN', 'AUDITOR']}>
              <DashboardSwitcher />
            </ProtectedRoute>
          } />

          <Route path="/submissions" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
              <IncomeStatus />
            </ProtectedRoute>
          } />

          {/* <Route path="/users" element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } /> */}
          
        </Route>

        {/* Catch-all redirect to login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import MainLayout from './layouts/MainLayout';
import IncomeStatus from './pages/receptionist/IncomeStatus';
import ProtectedRoute from './components/ProtectedRoute';
/* ... existing imports ... */
import BillingDashboard from './pages/receptionist/BillingDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          {/* Both roles can access the dashboard, but we use one path for simplicity now */}
          <Route path="/receptionist/dashboard" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'APPROVER', 'SUPERADMIN']}>
              <BillingDashboard />
            </ProtectedRoute>
          } />

          <Route path="/receptionist/submissions" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'APPROVER', 'SUPERADMIN']}>
              <IncomeStatus />
            </ProtectedRoute>
          } />
          <Route path="/approver/dashboard" element={
            <ProtectedRoute allowedRoles={['APPROVER', 'SUPERADMIN']}>
              <IncomeStatus />
            </ProtectedRoute>
          } />
        </Route>

        

        {/* Update your Login.jsx to navigate to /accounts/income for these roles */}
      </Routes>
    </Router>
  );
}

export default App
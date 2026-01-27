import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
// import BillingEntry from './pages/receptionist/BillingEntry';
// import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Receptionist Only */}
        {/* <Route path="/receptionist/billing" element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST', 'SUPERADMIN']}>
            <BillingEntry />
          </ProtectedRoute>
        } /> */}

        {/* Add more routes for Approver/Auditor here */}
      </Routes>
    </Router>
  );
}

export default App
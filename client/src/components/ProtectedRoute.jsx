import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;

  // Superadmins and Auditors have fundamental access rights
  if (requiredPermission && user.role !== 'SUPERADMIN' && user.role !== 'AUDITOR') {
    if (!user.permissions || !user.permissions[requiredPermission]) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
};

export default ProtectedRoute
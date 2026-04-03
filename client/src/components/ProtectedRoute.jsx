import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Verify JWT expiration locally
  const isTokenValid = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      return false;
    }
  };

  if (!token || !isTokenValid(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
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
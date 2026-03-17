
import ReceptionistHome  from '../pages/receptionist/ReceptionistHome'
import ApproverHome from '../pages/approver/ApproverHome'
import AdminHome from '../pages/admin/AdminHome'
import AuditorView from '../pages/auditor/AuditorView'
import StudentDashboard from '../pages/student/StudentDashboard'
import { Navigate } from 'react-router-dom'

const DashboardSwitcher = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role;

  switch (role) {
    case 'RECEPTIONIST':
      return <ReceptionistHome />;
    case 'APPROVER':
      return <ApproverHome />;
    case 'AUDITOR':
      return <AuditorView />;
    case 'SUPERADMIN':
      return <AdminHome />; 
    case 'STUDENT':
      return <StudentDashboard />;
    default:
      return <Navigate to="/unauthorized" />;
  }
};

export default DashboardSwitcher
import { 
  FileText, 
  Clock, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Users, 
  Wallet, 
  CalendarDays, 
  LineChart, 
  ShieldCheck, 
  Settings,
  LayoutDashboard,
  Truck,
  Layers,
  UserCog
} from 'lucide-react';

export const MENU_CONFIG = {
  RECEPTIONIST: [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Manage Students', path: '/management/students', icon: <Users className="w-5 h-5" /> },
    { name: 'Manage Vendors', path: '/management/vendors', icon: <Truck className="w-5 h-5" /> },
    { name: 'My Submissions', path: '/submissions', icon: <FileText className="w-5 h-5" /> },
  ],
  APPROVER: [
    { name: 'Pending Queue', path: '/dashboard', icon: <Clock className="w-5 h-5" /> },
    { name: 'Income Records', path: '/income', icon: <ArrowDownToLine className="w-5 h-5" /> },
    { name: 'Expense Records', path: '/expense', icon: <ArrowUpFromLine className="w-5 h-5" /> },
    { name: 'Payroll Records', path: '/payroll', icon: <Users className="w-5 h-5" />, permission: 'canAccessPayroll' },
    { name: 'Advance Records', path: '/advance', icon: <Wallet className="w-5 h-5" /> },
    { name: 'Due Records', path: '/due', icon: <CalendarDays className="w-5 h-5" /> },
    { name: 'Manage Students', path: '/management/students', icon: <Users className="w-5 h-5" /> },
    { name: 'Manage Vendors', path: '/management/vendors', icon: <Truck className="w-5 h-5" /> },
    { name: 'Financial Reports', path: '/reports', icon: <LineChart className="w-5 h-5" />, permission: 'canViewReports' },
  ],
  SUPERADMIN: [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Audit Logs', path: '/audit-log', icon: <ShieldCheck className="w-5 h-5" /> },
    { name: 'Staff Management', path: '/management/employees', icon: <UserCog className="w-5 h-5" /> },
    { name: 'Student Management', path: '/management/students', icon: <Users className="w-5 h-5" /> },
    { name: 'Vendor Management', path: '/management/vendors', icon: <Truck className="w-5 h-5" /> },
    { name: 'COA Setup', path: '/coa', icon: <Layers className="w-5 h-5" /> },
    { name: 'System Settings', path: '/management/settings', icon: <Settings className="w-5 h-5" /> },
  ],
  AUDITOR: [
    { name: 'Dashboard', path: '/dashboard', icon: <ShieldCheck className="w-5 h-5" /> },
    { name: 'Financial Reports', path: '/reports', icon: <LineChart className="w-5 h-5" /> },
  ],
  STUDENT: [
    { name: 'Profile', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ]
};
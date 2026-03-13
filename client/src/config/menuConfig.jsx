import { 
  Banknote, 
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
  LayoutDashboard
} from 'lucide-react';

export const MENU_CONFIG = {
  RECEPTIONIST: [
    { name: 'Transaction Entry', path: '/dashboard', icon: <Banknote className="w-5 h-5" /> },
    { name: 'My Submissions', path: '/submissions', icon: <FileText className="w-5 h-5" /> },
  ],
  APPROVER: [
    { name: 'Pending Queue', path: '/dashboard', icon: <Clock className="w-5 h-5" /> },
    { name: 'Income Records', path: '/income', icon: <ArrowDownToLine className="w-5 h-5" /> },
    { name: 'Expense Records', path: '/expense', icon: <ArrowUpFromLine className="w-5 h-5" /> },
    { name: 'Payroll Records', path: '/payroll', icon: <Users className="w-5 h-5" />, permission: 'canAccessPayroll' },
    { name: 'Advance Records', path: '/advance', icon: <Wallet className="w-5 h-5" /> },
    { name: 'Due Records', path: '/due', icon: <CalendarDays className="w-5 h-5" /> },
    { name: 'Financial Reports', path: '/reports', icon: <LineChart className="w-5 h-5" />, permission: 'canViewReports' },
  ],
  SUPERADMIN: [
    { name: 'Financial Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Master Ledger', path: '/audit-log', icon: <ShieldCheck className="w-5 h-5" /> },
    { name: 'User Management', path: '/users', icon: <Users className="w-5 h-5" /> },
    { name: 'COA Setup', path: '/coa', icon: <Settings className="w-5 h-5" /> },
  ],
  AUDITOR: [
    { name: 'Master Ledger', path: '/dashboard', icon: <ShieldCheck className="w-5 h-5" /> },
    { name: 'Financial Reports', path: '/reports', icon: <LineChart className="w-5 h-5" /> },
  ]
};
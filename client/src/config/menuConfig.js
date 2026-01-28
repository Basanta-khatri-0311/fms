export const MENU_CONFIG = {
  RECEPTIONIST: [
    { name: 'Transaction Entry', path: '/receptionist/dashboard', icon: '💰' },
    { name: 'My Submissions', path: '/receptionist/submissions', icon: '📄' },
  ],
  APPROVER: [
    { name: 'Pending Queue', path: '/approver/dashboard', icon: '⏳' },
    { name: 'Income Records', path: '/approver/income', icon: '💹' },
    { name: 'Expense Records', path: '/approver/expense', icon: '📉' },
    { name: 'Advance Records', path: '/approver/advance', icon: '📅' },
  ],
  SUPERADMIN: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
    { name: 'User Management', path: '/admin/users', icon: '👥' },
    { name: 'Financial Reports', path: '/admin/reports', icon: '📊' },
    { name: 'COA Setup', path: '/admin/coa', icon: '⚙️' },
  ],
  AUDITOR: [
    { name: 'Ledger Audit', path: '/auditor/ledger', icon: '🔍' },
    { name: 'Tax Registers', path: '/auditor/tax-reports', icon: '📜' },
  ]
};
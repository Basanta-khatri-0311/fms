export const MENU_CONFIG = {
  RECEPTIONIST: [
    { name: 'Transaction Entry', path: '/dashboard', icon: '💰' },
    { name: 'My Submissions', path: '/submissions', icon: '📄' },
  ],
  APPROVER: [
    { name: 'Pending Queue', path: '/dashboard', icon: '⏳' },
    { name: 'Income Records', path: '/income', icon: '💵' },
    { name: 'Expense Records', path: '/expense', icon: '💸' },
    { name: 'Advance Records', path: '/advance', icon: '✨' },
    { name: 'Due Records', path: '/due', icon: '📅' },
  ],
  SUPERADMIN: [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'User Management', path: '/users', icon: '👥' },
    { name: 'Financial Reports', path: '/reports', icon: '📊' },
    { name: 'COA Setup', path: '/coa', icon: '⚙️' },
  ],
  AUDITOR: [
    { name: 'Ledger Audit', path: '/ledger', icon: '🔍' },
    { name: 'Tax Registers', path: '/tax-reports', icon: '📜' },
  ]
};
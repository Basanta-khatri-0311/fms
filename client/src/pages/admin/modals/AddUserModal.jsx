import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X, UserPlus, ShieldCheck } from 'lucide-react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';
import { validateField } from '../../../utils/validation';

const AddUserModal = ({ onClose, refreshData, editData = null, type = 'employee' }) => {
  const isEdit = !!editData;
  const initialRole = type === 'student' ? 'STUDENT' : 'RECEPTIONIST';
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: initialRole,
    permissions: {
      canAccessPayroll: false,
      canViewReports: false,
      canExportReports: false,
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        role: editData.role || 'RECEPTIONIST',
        password: '',
        permissions: {
          canAccessPayroll: editData.permissions?.canAccessPayroll || false,
          canViewReports: editData.permissions?.canViewReports || false,
          canExportReports: editData.permissions?.canExportReports || false,
        }
      });
    }
  }, [editData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    const nameVal = validateField('name', formData.name);
    if (!nameVal.isValid) newErrors.name = nameVal.message;

    const emailVal = validateField('email', formData.email);
    if (!emailVal.isValid) newErrors.email = emailVal.message;

    // Only validate password if it's a new user OR if password is provided during edit
    if (!isEdit || formData.password) {
      const passVal = validateField('password', formData.password);
      if (!passVal.isValid) newErrors.password = passVal.message;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await API.patch(`/users/${editData._id}`, formData);
      } else {
        await API.post('/users', formData);
      }
      refreshData();
      onClose();
    } catch (err) {
      showNotification('error', err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${isEdit ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isEdit ? <ShieldCheck size={20} /> : <UserPlus size={20} />}
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {isEdit ? 'Edit ' : 'New '}
              {type === 'student' ? 'Student' : 'Staff Member'}
            </h2>
          </div>
          <p className="text-slate-500 text-sm">
            {isEdit ? 'Update account details and permissions.' : `Add a new ${type === 'student' ? 'student' : 'member'} to your organization.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
            <input
              required
              value={formData.name}
              placeholder="John Doe"
              className={`w-full px-4 py-3 bg-white border rounded-2xl outline-none text-sm transition-all focus:ring-4 placeholder:text-slate-300 ${
                errors.name ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
              }`}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
            <input
              required
              type="email"
              value={formData.email}
              placeholder="john@company.com"
              className={`w-full px-4 py-3 bg-white border rounded-2xl outline-none text-sm transition-all focus:ring-4 placeholder:text-slate-300 ${
                errors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
              }`}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Role Field - Hidden for Student Type */}
            {type !== 'student' ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Role</label>
                <select
                  value={formData.role}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm appearance-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-slate-700"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="APPROVER">Approver</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>
            ) : (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Role</label>
                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-400 font-bold">
                        STUDENT (Auto)
                    </div>
                </div>
            )}
            
            {/* Password Field */}
            <div className={`space-y-1.5 ${type === 'student' ? '' : ''}`}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                {isEdit ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <input
                  required={!isEdit}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEdit ? '••••••••' : 'Min. 8 chars'}
                  className={`w-full px-4 py-3 bg-white border rounded-2xl outline-none text-sm pr-11 transition-all focus:ring-4 placeholder:text-slate-300 ${
                    errors.password ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
                  }`}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2 leading-tight">{errors.password}</p>}
            </div>
          </div>

          {/* Permissions Section */}
          {(formData.role === 'RECEPTIONIST' || formData.role === 'APPROVER') && (
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Custom Permissions</label>
              <div className="grid grid-cols-1 gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.permissions.canAccessPayroll}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, canAccessPayroll: e.target.checked }
                    }))}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Access Payroll Forms</span>
                </label>
                {(formData.role === 'APPROVER') && (
                  <>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.permissions.canViewReports}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, canViewReports: e.target.checked }
                        }))}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">View and Export Financial Reports</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 ${
                isEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Member' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
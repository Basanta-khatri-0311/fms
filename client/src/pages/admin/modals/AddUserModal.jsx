import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X, Users, ShieldCheck, Mail, Lock, Key, ChevronDown } from 'lucide-react';
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
      canViewFinancialReports: false,
      canViewTaxationReports: false,
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
          canViewReports: editData.permissions?.canViewReports || editData.permissions?.canViewFinancialReports || editData.permissions?.canViewTaxationReports || false,
          canViewFinancialReports: editData.permissions?.canViewFinancialReports || false,
          canViewTaxationReports: editData.permissions?.canViewTaxationReports || false,
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
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 bg-slate-50/50">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-xl ${isEdit ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600 shadow-emerald-100'}`}>
              {isEdit ? <ShieldCheck size={22} /> : <Users size={22} />}
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {isEdit ? 'Edit Identity' : (type === 'student' ? 'Register Student' : 'Invite Staff Member')}
            </h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            {isEdit ? 'Update account details and security permissions.' : `Establish a new ${type === 'student' ? 'student' : 'staff'} identity in the directory.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Legal Name *</label>
            <div className="relative">
              <input
                required
                value={formData.name}
                placeholder="e.g. Johnathan Doe"
                className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl outline-none text-sm transition-all focus:ring-4 placeholder:text-slate-300 font-semibold ${
                  errors.name ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
                }`}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Users size={18} />
              </div>
            </div>
            {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address *</label>
            <div className="relative">
              <input
                required
                type="email"
                value={formData.email}
                placeholder="identity@organization.com"
                className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl outline-none text-sm transition-all focus:ring-4 placeholder:text-slate-300 font-semibold ${
                  errors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
                }`}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail size={18} />
              </div>
            </div>
            {errors.email && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Role Field */}
            {type !== 'student' ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Designated Role</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm appearance-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-slate-700 font-bold"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="APPROVER">Approver</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="SUPERADMIN">Super Admin</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            ) : (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Role</label>
                    <div className="relative">
                      <div className="w-full pl-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-400 font-black tracking-widest">
                          STUDENT
                      </div>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                        <Users size={18} />
                      </div>
                    </div>
                </div>
            )}
            
            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                {isEdit ? 'Security Refresh' : 'Security Credential *'}
              </label>
              <div className="relative">
                <input
                  required={!isEdit}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
                  className={`w-full pl-11 pr-12 py-3.5 bg-white border rounded-2xl outline-none text-sm transition-all focus:ring-4 placeholder:text-slate-300 font-semibold ${
                    errors.password ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
                  }`}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {isEdit ? <Key size={18} /> : <Lock size={18} />}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2 leading-tight">{errors.password}</p>}
            </div>
          </div>

          {/* Permissions Section */}
          {(formData.role === 'RECEPTIONIST' || formData.role === 'APPROVER' || formData.role === 'AUDITOR') && (
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Extended Permissions</label>
              <div className="grid grid-cols-1 gap-3 p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                {(formData.role !== 'AUDITOR') && (
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                        checked={formData.permissions.canAccessPayroll}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          permissions: { ...prev.permissions, canAccessPayroll: e.target.checked }
                        }))}
                      />
                      <div className="w-5 h-5 border-2 border-slate-300 rounded-lg group-hover:border-indigo-400 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center">
                        <div className="w-1.5 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Form Access: Payroll & Salary Records</span>
                  </label>
                )}
                
                {(formData.role === 'APPROVER' || formData.role === 'AUDITOR') && (
                  <>
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                          checked={formData.permissions.canViewReports}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canViewReports: e.target.checked }
                          }))}
                        />
                        <div className="w-5 h-5 border-2 border-slate-300 rounded-lg group-hover:border-indigo-400 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center">
                          <div className="w-1.5 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Access Dashboard: Overall Analytical Core</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                          checked={formData.permissions.canViewFinancialReports}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canViewFinancialReports: e.target.checked }
                          }))}
                        />
                        <div className="w-5 h-5 border-2 border-slate-300 rounded-lg group-hover:border-amber-400 transition-all peer-checked:bg-amber-500 peer-checked:border-amber-500 flex items-center justify-center pl-[2px]">
                          <div className="w-1.5 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-600 group-hover:text-amber-600 transition-colors">Analytics: View Financial Reports (Income Statment, Balance Sheet)</span>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer w-5 h-5 opacity-0 absolute cursor-pointer"
                          checked={formData.permissions.canViewTaxationReports}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, canViewTaxationReports: e.target.checked }
                          }))}
                        />
                        <div className="w-5 h-5 border-2 border-slate-300 rounded-lg group-hover:border-rose-400 transition-all peer-checked:bg-rose-600 peer-checked:border-rose-600 flex items-center justify-center pl-[2px]">
                          <div className="w-1.5 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-600 group-hover:text-rose-600 transition-colors">Analytics: View Taxation & Compliance (Annex 13, Registers)</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 text-slate-500 rounded-2xl text-sm font-black hover:bg-slate-50 transition-all uppercase tracking-widest"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3.5 text-white rounded-2xl text-sm font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest ${
                isEdit ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              {isSubmitting ? 'Syncing...' : isEdit ? 'Update Identity' : 'Create Identity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
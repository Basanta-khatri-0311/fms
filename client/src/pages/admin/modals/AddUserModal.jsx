import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X, UserPlus, ShieldCheck } from 'lucide-react';
import API from '../../../api/axiosConfig';

const AddUserModal = ({ onClose, refreshData, editData = null }) => {
  const isEdit = !!editData;
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'RECEPTIONIST' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || '',
        email: editData.email || '',
        role: editData.role || 'RECEPTIONIST',
        password: '' 
      });
    }
  }, [editData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      alert(err.response?.data?.message || "Operation failed");
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
              {isEdit ? 'Edit Member' : 'New Member'}
            </h2>
          </div>
          <p className="text-slate-500 text-sm">
            {isEdit ? 'Update account details and permissions.' : 'Add a new member to your organization.'}
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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
            <input
              required
              type="email"
              value={formData.email}
              placeholder="john@company.com"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Role Field */}
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
            
            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                {isEdit ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <input
                  required={!isEdit}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEdit ? '••••••••' : 'Min. 8 chars'}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm pr-11 transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
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
            </div>
          </div>

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
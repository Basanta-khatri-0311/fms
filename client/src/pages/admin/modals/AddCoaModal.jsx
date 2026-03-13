import React, { useState, useEffect } from 'react';
import { X, BookOpen, Settings2, Hash } from 'lucide-react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';

const CoaModal = ({ onClose, refreshData, editData = null }) => {
  const isEdit = !!editData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'ASSET'
  });

  // Sync state if editing (Key for ensuring data shows up on edit)
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || '',
        code: editData.code || '',
        type: editData.type || 'ASSET'
      });
    } else {
      setFormData({ name: '', code: '', type: 'ASSET' });
    }
  }, [editData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await API.patch(`/coa/${editData._id}`, formData);
      } else {
        await API.post('/coa', formData);
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
              {isEdit ? <Settings2 size={20} /> : <BookOpen size={20} />}
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {isEdit ? 'Update Account' : 'New Ledger Account'}
            </h2>
          </div>
          <p className="text-slate-500 text-sm">
            {isEdit ? `Modifying properties for ${editData.code}` : 'Define a new category for your financial records.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
          {/* Account Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Account Name</label>
            <input
              required
              value={formData.name}
              placeholder="e.g. Office Supplies"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unique Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Unique Code</label>
              <div className="relative">
                <input
                  required
                  value={formData.code}
                  disabled={isEdit}
                  placeholder="5001"
                  className={`w-full px-4 py-3 border rounded-2xl outline-none text-sm font-mono transition-all pr-10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 ${
                    isEdit 
                      ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed' 
                      : 'bg-white border-slate-200 placeholder:text-slate-300'
                  }`}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
                <Hash size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>

            {/* Account Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Account Type</label>
              <select
                value={formData.type}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm appearance-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 text-slate-700"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-500 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-4 py-3 text-white rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                isEdit 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
              }`}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Account' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoaModal;
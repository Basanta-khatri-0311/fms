import React, { useState, useEffect } from 'react';
import { X, BookOpen, Settings2, Hash, Layers, ChevronDown } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col my-4 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative px-10 pt-10 pb-8 bg-slate-50/50 shrink-0">
          <button 
            onClick={onClose}
            className="absolute right-8 top-8 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all shadow-sm"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-2xl ${isEdit ? 'bg-indigo-100 text-indigo-600 shadow-indigo-100' : 'bg-emerald-100 text-emerald-600 shadow-emerald-100'}`}>
              {isEdit ? <Settings2 size={26} /> : <BookOpen size={26} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {isEdit ? 'Update Account' : 'New Ledger Account'}
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-0.5">
                {isEdit ? `Modifying classification for ${editData.code}` : 'Define a new category for your financial records.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-8 scrollbar-hide">
          <form id="coa-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Classification Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-6 rounded-full ${isEdit ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Chart Identity</h3>
              </div>

              <div className="space-y-6">
                {/* Account Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Name *</label>
                  <div className="relative">
                    <input
                      required
                      value={formData.name}
                      placeholder="e.g. Office Supplies"
                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <BookOpen size={18} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Unique Code */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">System Code *</label>
                    <div className="relative">
                      <input
                        required
                        value={formData.code}
                        disabled={isEdit}
                        placeholder="5001"
                        className={`w-full pl-11 pr-4 py-4 border rounded-2xl text-sm font-mono font-bold transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 ${
                          isEdit 
                            ? 'bg-slate-50/50 text-slate-400 border-slate-100 cursor-not-allowed' 
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Hash size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Account Type */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Class *</label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        className="w-full pl-11 pr-10 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 appearance-none cursor-pointer transition-all"
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      >
                        {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Layers size={18} />
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 rounded-b-[2.5rem] flex flex-col-reverse sm:flex-row justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 text-sm font-black text-slate-500 hover:text-slate-700 hover:bg-white rounded-2xl transition-all uppercase tracking-widest"
          >
            Discard
          </button>
          <button
            type="submit"
            form="coa-form"
            disabled={isSubmitting}
            className={`px-10 py-4 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm ${
              isEdit 
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-100' 
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            {isSubmitting ? 'Synchronizing...' : isEdit ? 'Update Details' : 'Commit Ledger'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoaModal;
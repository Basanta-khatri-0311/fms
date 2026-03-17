import React, { useState, useEffect } from 'react';
import { X, Truck, ShieldCheck, Mail, Phone, MapPin, Hash } from 'lucide-react';
import API from '../../../api/axiosConfig';
import { showNotification } from '../../../utils/toast';
import { validateField, handleNumberKeyDown } from '../../../utils/validation';

const AddVendorModal = ({ onClose, refreshData, editData = null }) => {
  const isEdit = !!editData;
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    contactNumber: '',
    email: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        name: editData.name || '',
        pan: editData.pan || '',
        contactNumber: editData.contactNumber || '',
        email: editData.email || '',
        address: editData.address || ''
      });
    }
  }, [editData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    const nameVal = validateField('name', formData.name);
    if (!nameVal.isValid) newErrors.name = nameVal.message;

    const panVal = validateField('pan', formData.pan);
    if (!panVal.isValid) newErrors.pan = panVal.message;

    if (formData.email) {
        const emailVal = validateField('email', formData.email);
        if (!emailVal.isValid) newErrors.email = emailVal.message;
    }

    if (formData.contactNumber) {
        const phoneVal = validateField('phone', formData.contactNumber);
        if (!phoneVal.isValid) newErrors.contactNumber = phoneVal.message;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await API.patch(`/vendors/${editData._id}`, formData);
      } else {
        await API.post('/vendors', formData);
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
              {isEdit ? <ShieldCheck size={22} /> : <Truck size={22} />}
            </div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {isEdit ? 'Edit Vendor' : 'New Vendor Registration'}
            </h2>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            {isEdit ? 'Update vendor details and financial references.' : 'Add a new supplier or service provider to your records.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name Field */}
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Vendor / Business Name *</label>
                <div className="relative">
                    <input
                        required
                        value={formData.name}
                        placeholder="e.g. Acme Corporation"
                        className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl outline-none text-sm transition-all focus:ring-4 placeholder:text-slate-300 font-semibold ${
                            errors.name ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
                        }`}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Truck size={18} />
                    </div>
                </div>
                {errors.name && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2">{errors.name}</p>}
            </div>

            {/* PAN Field */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">PAN Number *</label>
                <div className="relative">
                    <input
                        required
                        value={formData.pan}
                        placeholder="9-digit PAN"
                        maxLength={9}
                        onKeyDown={handleNumberKeyDown}
                        className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl outline-none text-sm transition-all focus:ring-4 placeholder:text-slate-300 font-mono font-bold ${
                            errors.pan ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
                        }`}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Hash size={18} />
                    </div>
                </div>
                {errors.pan && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2">{errors.pan}</p>}
            </div>

            {/* Phone Field */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</label>
                <div className="relative">
                    <input
                        value={formData.contactNumber}
                        placeholder="98XXXXXXXX"
                        maxLength={10}
                        onKeyDown={handleNumberKeyDown}
                        className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-2xl outline-none text-sm transition-all focus:ring-4 placeholder:text-slate-300 font-semibold ${
                            errors.contactNumber ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/5' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/5'
                        }`}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone size={18} />
                    </div>
                </div>
                {errors.contactNumber && <p className="text-rose-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-left-2">{errors.contactNumber}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                    <input
                        type="email"
                        value={formData.email}
                        placeholder="vendor@business.com"
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

            {/* Address Field */}
            <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Address</label>
                <div className="relative">
                    <input
                        value={formData.address}
                        placeholder="Street, City, District"
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none text-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300 font-semibold"
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <MapPin size={18} />
                    </div>
                </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
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
              {isSubmitting ? 'Processing...' : isEdit ? 'Update Vendor' : 'Register Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;

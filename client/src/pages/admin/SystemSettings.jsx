import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import { validateField } from '../../utils/validation';
import { 
  Settings, 
  Save, 
  Calendar, 
  Type, 
  Coins, 
  Plus, 
  Trash2,
  RefreshCw,
  Info,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const SystemSettings = () => {
  const { refreshSettings } = useSystemSettings();
  const [settings, setSettings] = useState({
    systemName: '',
    logoUrl: '',
    logoFile: null,
    currencySymbol: '',
    orgDetails: {
      address: '',
      phone: '',
      email: '',
      website: '',
      slogan: ''
    },
    fiscalYearBS: '',
    availableFiscalYears: [],
    startDateAD: '',
    endDateAD: '',
    taxSettings: {
      vatRate: 13,
      panNumber: '',
      tdsRates: {
        rent: 10,
        consultancy: 1.5,
        salary: 1
      }
    },
    controls: {
      allowBackdatedEntries: true,
      auditLockDate: '',
      autoApprovalLimit: 0,
      timezone: 'Asia/Kathmandu'
    },
    branches: []
  });

  const [newBranch, setNewBranch] = useState({ name: '', code: '', address: '' });

  const [newYear, setNewYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await API.get('/system');
      const data = response.data;
      
      setSettings({
        ...data,
        availableFiscalYears: (data.availableFiscalYears || []).map(fy => 
          typeof fy === 'string' 
            ? { year: fy, startDateAD: fy === data.fiscalYearBS ? data.startDateAD : '', endDateAD: fy === data.fiscalYearBS ? data.endDateAD : '' } 
            : fy
        ),
        startDateAD: data.startDateAD ? new Date(data.startDateAD).toISOString().split('T')[0] : '',
        endDateAD: data.endDateAD ? new Date(data.endDateAD).toISOString().split('T')[0] : '',
        controls: {
          ...data.controls,
          auditLockDate: data.controls?.auditLockDate ? new Date(data.controls.auditLockDate).toISOString().split('T')[0] : '',
        },
        branches: data.branches || []
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load system settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const payload = new FormData();
      if (settings.logoFile) {
        payload.append('logo', settings.logoFile);
      }
      
      // Separate out the physical file from the JSON payload
      const { logoFile, ...jsonSettings } = settings;
      payload.append('settings', JSON.stringify(jsonSettings));

      // Comprehensive Validation
      const { systemName, orgDetails, taxSettings, startDateAD, endDateAD } = settings;
      
      if (!systemName?.trim()) {
        setMessage({ type: 'error', text: 'System Name is required' });
        setSaving(false);
        return;
      }

      if (!orgDetails?.address?.trim()) {
        setMessage({ type: 'error', text: 'Address is required' });
        setSaving(false);
        return;
      }

      // Centralized Validation
      const emailVal = validateField('email', orgDetails.email);
      if (orgDetails.email && !emailVal.isValid) {
        setMessage({ type: 'error', text: `Org Email: ${emailVal.message}` });
        setSaving(false);
        return;
      }

      const phoneVal = validateField('phone', orgDetails.phone?.replace(/[-\s]/g, ''));
      if (!phoneVal.isValid) {
        setMessage({ type: 'error', text: `Org Phone: ${phoneVal.message}` });
        setSaving(false);
        return;
      }

      const panVal = validateField('pan', taxSettings?.panNumber);
      if (taxSettings?.panNumber && !panVal.isValid) {
        setMessage({ type: 'error', text: `Org PAN: ${panVal.message}` });
        setSaving(false);
        return;
      }

      // Date Validation: Start Date < End Date
      if (new Date(startDateAD) >= new Date(endDateAD)) {
        setMessage({ type: 'error', text: 'Reporting Start Date must be before End Date' });
        setSaving(false);
        return;
      }

      await API.patch('/system', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      refreshSettings();
      setMessage({ type: 'success', text: 'Settings saved and synced system-wide!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const addFiscalYear = () => {
    if (newYear && !settings.availableFiscalYears.some(fy => fy.year === newYear)) {
      setSettings({
        ...settings,
        availableFiscalYears: [...settings.availableFiscalYears, { 
          year: newYear, 
          startDateAD: '', 
          endDateAD: '' 
        }].sort((a, b) => a.year.localeCompare(b.year))
      });
      setNewYear('');
    }
  };

  const removeFiscalYear = (year) => {
    if (year === settings.fiscalYearBS) {
      setMessage({ type: 'error', text: 'Cannot remove the active fiscal year' });
      return;
    }
    setSettings({
      ...settings,
      availableFiscalYears: settings.availableFiscalYears.filter(fy => fy.year !== year)
    });
  };

  const handleDateChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
      availableFiscalYears: prev.availableFiscalYears.map(fy => 
        fy.year === prev.fiscalYearBS ? { ...fy, [field]: value } : fy
      )
    }));
  };

  const activateYear = (fy) => {
    setSettings({
      ...settings,
      fiscalYearBS: fy.year,
      startDateAD: fy.startDateAD ? new Date(fy.startDateAD).toISOString().split('T')[0] : '',
      endDateAD: fy.endDateAD ? new Date(fy.endDateAD).toISOString().split('T')[0] : ''
    });
  };

  const addBranch = () => {
    if (newBranch.name && newBranch.code) {
      if (settings.branches.some(b => b.code === newBranch.code)) {
        setMessage({ type: 'error', text: 'Branch with this code already exists' });
        return;
      }
      setSettings({
        ...settings,
        branches: [...settings.branches, { ...newBranch, active: true }]
      });
      setNewBranch({ name: '', code: '', address: '' });
      setMessage({ type: 'success', text: 'Branch added to list. Click SAVE below to sync.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const toggleBranch = (code) => {
    setSettings({
      ...settings,
      branches: settings.branches.map(b => 
        b.code === code ? { ...b, active: !b.active } : b
      )
    });
  };

  const removeBranch = (code) => {
    setSettings({
      ...settings,
      branches: settings.branches.filter(b => b.code !== code)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md pt-8 pb-4 z-20">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg">
              <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Control Center</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">Manage your institution's configuration and operational rules.</p>
        </div>
        
        {message.text && (
          <div className={`px-6 py-3 rounded-2xl text-sm font-black border shadow-xl animate-in fade-in slide-in-from-top-4 ${
            message.type === 'success' 
              ? 'bg-emerald-500 text-white border-emerald-400' 
              : 'bg-rose-500 text-white border-rose-400'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        {/* Core Identity Section */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-7 bg-indigo-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Institutional Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">System Name</label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  placeholder="e.g., Global Education Finance"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Upload Logo Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSettings({ ...settings, logoFile: e.target.files[0] })}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 hover:file:cursor-pointer transition-all"
                  />
                  {settings.logoUrl && !settings.logoFile && (
                    <p className="mt-2 ml-2 text-xs font-bold text-emerald-600">Active logo: {settings.logoUrl.split('/').pop()}</p>
                  )}
                  {settings.logoFile && (
                    <p className="mt-2 ml-2 text-xs font-bold text-indigo-600">New logo selected: {settings.logoFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Address</label>
                <input
                  type="text"
                  value={settings.orgDetails?.address}
                  onChange={(e) => setSettings({ ...settings, orgDetails: { ...settings.orgDetails, address: e.target.value } })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Number</label>
                <input
                  type="text"
                  value={settings.orgDetails?.phone}
                  onChange={(e) => setSettings({ ...settings, orgDetails: { ...settings.orgDetails, phone: e.target.value } })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Official Email</label>
                <input
                  type="email"
                  value={settings.orgDetails?.email}
                  onChange={(e) => setSettings({ ...settings, orgDetails: { ...settings.orgDetails, email: e.target.value } })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Website URL</label>
                <input
                  type="text"
                  value={settings.orgDetails?.website}
                  onChange={(e) => setSettings({ ...settings, orgDetails: { ...settings.orgDetails, website: e.target.value } })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Org PAN / VAT Number</label>
                <input
                  type="text"
                  value={settings.taxSettings?.panNumber}
                  onChange={(e) => setSettings({ ...settings, taxSettings: { ...settings.taxSettings, panNumber: e.target.value } })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  placeholder="9-digit PAN Number"
                />
            </div>
          </div>
        </section>
        
        {/* Financial Core section */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-7 bg-indigo-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Financial Core</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Currency Symbol</label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  placeholder="e.g. NPR"
                />
            </div>
            <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal VAT Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxSettings?.vatRate}
                  onChange={(e) => setSettings({ ...settings, taxSettings: { ...settings.taxSettings, vatRate: Number(e.target.value) } })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-50 rounded-[2rem]">
               <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Rent TDS (%)</label>
                  <input
                    type="number"
                    value={settings.taxSettings?.tdsRates?.rent}
                    onChange={(e) => setSettings({ ...settings, taxSettings: { ...settings.taxSettings, tdsRates: { ...settings.taxSettings.tdsRates, rent: Number(e.target.value) } } })}
                    className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none shadow-sm"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Consultancy TDS (%)</label>
                  <input
                    type="number"
                    value={settings.taxSettings?.tdsRates?.consultancy}
                    onChange={(e) => setSettings({ ...settings, taxSettings: { ...settings.taxSettings, tdsRates: { ...settings.taxSettings.tdsRates, consultancy: Number(e.target.value) } } })}
                    className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none shadow-sm"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Salary TDS (%)</label>
                  <input
                    type="number"
                    value={settings.taxSettings?.tdsRates?.salary}
                    onChange={(e) => setSettings({ ...settings, taxSettings: { ...settings.taxSettings, tdsRates: { ...settings.taxSettings.tdsRates, salary: Number(e.target.value) } } })}
                    className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none shadow-sm"
                  />
               </div>
            </div>
          </div>
        </section>
        
        {/* Fiscal Year & Dates Section */}

        <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-7 bg-emerald-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Fiscal Intelligence</h2>
          </div>

          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 bg-emerald-50/50 rounded-[2rem] border border-emerald-100">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em] ml-1">Reporting Period Start (AD)</label>
                <input
                  type="date"
                  value={settings.startDateAD}
                  onChange={(e) => handleDateChange('startDateAD', e.target.value)}
                  className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-black text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em] ml-1">Reporting Period End (AD)</label>
                <input
                  type="date"
                  value={settings.endDateAD}
                  onChange={(e) => handleDateChange('endDateAD', e.target.value)}
                  className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-black text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-sm"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-3 text-emerald-600">
                <Info className="w-4 h-4 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  Data displayed in the main dashboard and audit reports is automatically filtered within this active date range.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Managed Fiscal Cycles</h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">Add or switch between business years.</p>
                </div>
                <div className="flex gap-3">
                   <div className="relative">
                    <input
                      type="text"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      placeholder="BS Format"
                      className="pl-5 pr-14 py-3.5 bg-slate-100 border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 w-44 outline-none"
                    />
                    <button
                      type="button"
                      onClick={addFiscalYear}
                      className="absolute right-1.5 top-1.5 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95 shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {settings.availableFiscalYears?.map((fy) => {
                  const year = typeof fy === 'string' ? fy : fy.year;
                  const isActive = year === settings.fiscalYearBS;
                  return (
                    <div 
                      key={year}
                      className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4
                        ${isActive 
                          ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-500/5' 
                          : 'bg-slate-50 border-transparent hover:border-slate-300 shadow-inner'}`}
                    >
                      <span className={`text-base font-black tracking-widest ${isActive ? 'text-indigo-700' : 'text-slate-600'}`}>
                        {year}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => activateYear(fy)}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all
                          ${isActive 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                            : 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-100 shadow-sm'}`}
                      >
                        {isActive ? 'Current' : 'Activate'}
                      </button>

                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => removeFiscalYear(year)}
                          className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Branch Management Section */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-7 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Organization Branches</h2>
          </div>

          <div className="space-y-12">
            <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
              <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest mb-6">Add New Branch</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Name</label>
                  <input
                    type="text"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-blue-500 shadow-sm outline-none transition-all"
                    placeholder="e.g. Kathmandu"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Code</label>
                  <input
                    type="text"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value.toUpperCase() })}
                    className="w-full px-5 py-3.5 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-blue-500 shadow-sm outline-none transition-all"
                    placeholder="e.g. KTM"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address & Save</label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newBranch.address}
                      onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                      className="flex-1 px-5 py-3.5 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-blue-500 shadow-sm outline-none transition-all text-sm"
                      placeholder="e.g. Putalisadak, Kathmandu"
                    />
                    <button
                      type="button"
                      onClick={addBranch}
                      className="px-8 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20 whitespace-nowrap"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settings.branches?.map((branch) => (
                <div 
                  key={branch.code}
                  className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col gap-4
                    ${branch.active 
                      ? 'bg-white border-blue-100 shadow-xl shadow-blue-100/20' 
                      : 'bg-slate-50 border-transparent opacity-60'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black text-slate-800 tracking-tight">{branch.name}</h4>
                      <p className="text-xs font-black text-blue-600 tracking-widest uppercase">{branch.code}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest
                      ${branch.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                      {branch.active ? 'Active' : 'Deactivated'}
                    </div>
                  </div>
                  
                  {branch.address && (
                    <p className="text-xs text-slate-500 font-medium">{branch.address}</p>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => toggleBranch(branch.code)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${branch.active 
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                    >
                      {branch.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBranch(branch.code)}
                      className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(!settings.branches || settings.branches.length === 0) && (
                <div className="md:col-span-3 py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem]">
                  <p className="font-bold">No branches configured yet.</p>
                  <p className="text-xs mt-1">Add your first branch above to start tracking location-based finances.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Global Controls */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-7 bg-slate-800 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Audit & Security Controls</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">System Timezone</label>
              <select
                 value={settings.controls?.timezone}
                 onChange={(e) => setSettings({ ...settings, controls: { ...settings.controls, timezone: e.target.value } })}
                 className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 transition-all outline-none appearance-none cursor-pointer"
              >
                  <option value="Asia/Kathmandu">Asia/Kathmandu (NPT)</option>
                  <option value="UTC">Universal Coordinated Time (UTC)</option>
              </select>
            </div>

            <div className="space-y-6">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Audit Lock Date</label>
              <input
                type="date"
                value={settings.controls?.auditLockDate}
                onChange={(e) => setSettings({ ...settings, controls: { ...settings.controls, auditLockDate: e.target.value } })}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-slate-800 focus:ring-4 focus:ring-slate-800/5 transition-all outline-none"
              />
              <p className="px-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Transactions created before this date cannot be modified or deleted.
              </p>
            </div>

            <div className="md:col-span-2 p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2">
                <h4 className="text-lg font-black tracking-tight">Manual Backdating Policy</h4>
                <p className="text-xs text-slate-400 font-medium">Allow users to record transactions with dates in the past.</p>
              </div>
              
              <button
                type="button"
                onClick={() => setSettings({ ...settings, controls: { ...settings.controls, allowBackdatedEntries: !settings.controls?.allowBackdatedEntries } })}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 ${
                  settings.controls?.allowBackdatedEntries 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-rose-500 text-white shadow-rose-500/20'
                }`}
              >
                {settings.controls?.allowBackdatedEntries ? 'ENABLED' : 'DISABLED'}
                {settings.controls?.allowBackdatedEntries ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </section>

        {/* Global Floating Save Button */}
        <div className="fixed bottom-10 right-10 z-[100]">
          <button
            type="submit"
            disabled={saving}
            className="group w-20 h-20 bg-indigo-600 text-white rounded-full shadow-[0_20px_50px_rgba(79,70,229,0.3)]
              hover:bg-indigo-500 hover:-translate-y-3 hover:scale-110 active:scale-90 transition-all duration-500
              flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Save System Settings"
          >
            {saving ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Save className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;

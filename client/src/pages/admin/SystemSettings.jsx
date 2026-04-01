import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
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
  ShieldCheck
} from 'lucide-react';
import { useSystemSettings } from '../../context/SystemSettingsContext';

const SystemSettings = () => {
  const { refreshSettings } = useSystemSettings();
  const [settings, setSettings] = useState({
    systemName: '',
    logoUrl: '',
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
    documentSettings: {
      invoicePrefix: 'INV',
      billPrefix: 'EXP',
      nextInvoiceNum: 1,
      nextBillNum: 1
    },
    controls: {
      allowBackdatedEntries: true,
      auditLockDate: '',
      autoApprovalLimit: 0,
      timezone: 'Asia/Kathmandu'
    }
  });

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
        startDateAD: data.startDateAD ? new Date(data.startDateAD).toISOString().split('T')[0] : '',
        endDateAD: data.endDateAD ? new Date(data.endDateAD).toISOString().split('T')[0] : '',
        controls: {
          ...data.controls,
          auditLockDate: data.controls?.auditLockDate ? new Date(data.controls.auditLockDate).toISOString().split('T')[0] : '',
        }
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
      await API.patch('/system', settings);
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
    if (newYear && !settings.availableFiscalYears.includes(newYear)) {
      setSettings({
        ...settings,
        availableFiscalYears: [...settings.availableFiscalYears, newYear].sort()
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
      availableFiscalYears: settings.availableFiscalYears.filter(y => y !== year)
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
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Logo URL</label>
                <input
                  type="text"
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                  placeholder="https://..."
                />
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
          </div>
        </section>

        {/* Financial Year & Dates Section */}
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
                  onChange={(e) => setSettings({ ...settings, startDateAD: e.target.value })}
                  className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-sm"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-emerald-700 uppercase tracking-[0.2em] ml-1">Reporting Period End (AD)</label>
                <input
                  type="date"
                  value={settings.endDateAD}
                  onChange={(e) => setSettings({ ...settings, endDateAD: e.target.value })}
                  className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none shadow-sm"
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
                {settings.availableFiscalYears?.map((year) => (
                  <div 
                    key={year}
                    className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4
                      ${year === settings.fiscalYearBS 
                        ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-500/5' 
                        : 'bg-slate-50 border-transparent hover:border-slate-300 shadow-inner'}`}
                  >
                    <span className={`text-base font-black tracking-widest ${year === settings.fiscalYearBS ? 'text-indigo-700' : 'text-slate-600'}`}>
                      {year}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, fiscalYearBS: year })}
                      className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all
                        ${year === settings.fiscalYearBS 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                          : 'bg-white text-slate-400 border border-slate-200 hover:text-indigo-600 hover:border-indigo-100 shadow-sm'}`}
                    >
                      {year === settings.fiscalYearBS ? 'Current' : 'Activate'}
                    </button>

                    {year !== settings.fiscalYearBS && (
                      <button
                        type="button"
                        onClick={() => removeFiscalYear(year)}
                        className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg active:scale-90"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Operational Flow & Documents */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-7 bg-orange-500 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Document Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8 p-8 bg-slate-50 rounded-[2rem]">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice Prefix</label>
                <input
                  type="text"
                  value={settings.documentSettings?.invoicePrefix}
                  onChange={(e) => setSettings({ ...settings, documentSettings: { ...settings.documentSettings, invoicePrefix: e.target.value } })}
                  className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 shadow-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Next Invoice Number</label>
                <input
                  type="number"
                  value={settings.documentSettings?.nextInvoiceNum}
                  onChange={(e) => setSettings({ ...settings, documentSettings: { ...settings.documentSettings, nextInvoiceNum: Number(e.target.value) } })}
                  className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 shadow-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-8 p-8 bg-slate-50 rounded-[2rem]">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Bill/Expense Prefix</label>
                <input
                  type="text"
                  value={settings.documentSettings?.billPrefix}
                  onChange={(e) => setSettings({ ...settings, documentSettings: { ...settings.documentSettings, billPrefix: e.target.value } })}
                  className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 shadow-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Next Bill Number</label>
                <input
                  type="number"
                  value={settings.documentSettings?.nextBillNum}
                  onChange={(e) => setSettings({ ...settings, documentSettings: { ...settings.documentSettings, nextBillNum: Number(e.target.value) } })}
                  className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 shadow-sm outline-none transition-all"
                />
              </div>
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

        {/* Global Save Button */}
        <div className="fixed bottom-10 right-10 z-[100]">
          <button
            type="submit"
            disabled={saving}
            className="group px-10 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl shadow-indigo-600/30
              hover:bg-indigo-500 hover:-translate-y-2 hover:scale-105 active:scale-95 transition-all duration-300
              flex items-center gap-4 disabled:opacity-50"
          >
            <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
              <Save className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] opacity-70 uppercase tracking-widest">Commit Changes</span>
              <span className="text-lg">{saving ? 'SYNCHRONIZING...' : 'SAVE SETTINGS'}</span>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;

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
    currencySymbol: '',
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
      
      // Format dates for input[type="date"]
      setSettings({
        ...data,
        startDateAD: data.startDateAD ? new Date(data.startDateAD).toISOString().split('T')[0] : '',
        endDateAD: data.endDateAD ? new Date(data.endDateAD).toISOString().split('T')[0] : '',
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
      setMessage({ type: 'success', text: 'Settings updated successfully' });
      // Clear message after 3 seconds
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Settings className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Settings</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">Manage your institution's name, currency, and financial periods.</p>
        </div>
        
        {message.text && (
          <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          } animate-in fade-in slide-in-from-top-2`}>
            {message.text}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Core Identity Section */}
        <section className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-100 border border-slate-100 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Type className="w-32 h-32" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Business Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Type className="w-3 h-3" /> System Display Name
              </label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g., XYZ Finance Management"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Coins className="w-3 h-3" /> Currency Reference
              </label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g., NPR."
              />
            </div>
          </div>
        </section>

        {/* Fiscal Intelligence Section */}
        <section className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-100 border border-slate-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Financial Periods</h2>
          </div>

          <div className="space-y-10">
            {/* Active Period Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100/50">
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Active Period Start (AD)
                </label>
                <input
                  type="date"
                  value={settings.startDateAD}
                  onChange={(e) => setSettings({ ...settings, startDateAD: e.target.value })}
                  className="w-full px-5 py-4 bg-white border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Active Period End (AD)
                </label>
                <input
                  type="date"
                  value={settings.endDateAD}
                  onChange={(e) => setSettings({ ...settings, endDateAD: e.target.value })}
                  className="w-full px-5 py-4 bg-white border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                <Info className="w-3 h-3" />
                This date range determines which records are included in your current reports and dashboard.
              </div>
            </div>

            {/* Fiscal Year Management */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-black text-slate-800 uppercase tracking-tight">Available Fiscal Years</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Define valid periods for data entries</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="e.g., 2082/83"
                    className="px-4 py-2 bg-slate-100 border-none rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 w-32"
                  />
                  <button
                    type="button"
                    onClick={addFiscalYear}
                    className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {settings.availableFiscalYears.map((year) => (
                  <div 
                    key={year}
                    className={`relative group px-4 py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3
                      ${year === settings.fiscalYearBS 
                        ? 'bg-indigo-50 border-indigo-200 shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-100 hover:border-slate-300'}`}
                  >
                    <span className={`text-sm font-black tracking-widest ${year === settings.fiscalYearBS ? 'text-indigo-700' : 'text-slate-600'}`}>
                      {year}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, fiscalYearBS: year })}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all
                        ${year === settings.fiscalYearBS 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'}`}
                    >
                      {year === settings.fiscalYearBS ? 'Active Period' : 'Set Active'}
                    </button>

                    {year !== settings.fiscalYearBS && (
                      <button
                        type="button"
                        onClick={() => removeFiscalYear(year)}
                        className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-rose-200 active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tax & Compliance Section */}
        <section className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-100 border border-slate-100 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <ShieldCheck className="w-32 h-32" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-6 bg-rose-600 rounded-full" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Tax & Compliance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                VAT Rate (%)
              </label>
              <input
                type="number"
                value={settings.taxSettings.vatRate}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  taxSettings: { ...settings.taxSettings, vatRate: Number(e.target.value) } 
                })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Company PAN Number
              </label>
              <input
                type="text"
                value={settings.taxSettings.panNumber}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  taxSettings: { ...settings.taxSettings, panNumber: e.target.value } 
                })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 transition-all"
                placeholder="9-digit PAN"
              />
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">TDS Rates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rent TDS (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxSettings.tdsRates.rent}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    taxSettings: { 
                      ...settings.taxSettings, 
                      tdsRates: { ...settings.taxSettings.tdsRates, rent: Number(e.target.value) } 
                    } 
                  })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultancy TDS (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxSettings.tdsRates.consultancy}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    taxSettings: { 
                      ...settings.taxSettings, 
                      tdsRates: { ...settings.taxSettings.tdsRates, consultancy: Number(e.target.value) } 
                    } 
                  })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary TDS (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.taxSettings.tdsRates.salary}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    taxSettings: { 
                      ...settings.taxSettings, 
                      tdsRates: { ...settings.taxSettings.tdsRates, salary: Number(e.target.value) } 
                    } 
                  })}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Global Action Bar */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-200">
          <div className="flex items-center gap-4 text-slate-400">
            <RefreshCw className={`w-5 h-5 ${saving ? 'animate-spin text-indigo-500' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Changes will take effect across the system</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="group px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-900/20
              hover:bg-slate-800 hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 
              active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className={`w-5 h-5 ${saving ? 'animate-pulse' : 'group-hover:rotate-6 transition-transform'}`} />
            {saving ? 'SAVING...' : 'SAVE SETTINGS'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;

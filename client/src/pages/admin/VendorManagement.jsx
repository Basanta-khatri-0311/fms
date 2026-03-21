import { useState, useEffect } from 'react';
import { Truck, Search, Plus, Filter, CheckCircle2, ShieldAlert, Edit3, Mail, Phone } from 'lucide-react';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import API from '../../api/axiosConfig';
import AddVendorModal from './modals/AddVendorModal';
import EntityHistoryModal from '../../components/modals/EntityHistoryModal';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const VendorManagement = () => {
    const { settings } = useSystemSettings();
    const [vendors, setVendors] = useState([]);
    const [activeVendor, setActiveVendor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmStatusData, setConfirmStatusData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [historyEntityId, setHistoryEntityId] = useState(null);

    useEffect(() => { fetchVendors(); }, []);

    const fetchVendors = async () => {
        try {
            setIsLoading(true);
            const { data } = await API.get('/vendors');
            setVendors(data.data || (Array.isArray(data) ? data : []));
        } catch (err) { 
            console.error(err); 
            triggerToast("Failed to fetch vendors", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleToggleStatus = async () => {
        if (!confirmStatusData) return;
        const { vendor, newStatus } = confirmStatusData;

        try {
            await API.patch(`/vendors/${vendor._id}/status`, { status: newStatus });
            fetchVendors();
            triggerToast(`Vendor ${newStatus.toLowerCase()} successfully`, "warning");
        } catch (err) {
            triggerToast(err.response?.data?.message || "Status update failed", "error");
        } finally {
            setConfirmStatusData(null);
        }
    };

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            v.pan.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === '' || v.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <Truck size={24} />
                        </div>
                        Vendor Management
                    </h2>
                    <p className="text-slate-500 font-medium mt-1 ml-1">Manage suppliers, service providers and accounts payable.</p>
                </div>
                <button
                    onClick={() => { setActiveVendor(null); setIsModalOpen(true); }}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                    <Plus size={18} />
                    Add New Vendor
                </button>
            </div>

            {/* toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search by name, PAN or email..."
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium text-sm shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex items-center px-4 shadow-sm group">
                        <Filter className="text-slate-400 mr-3" size={18} />
                        <select 
                            className="flex-1 bg-transparent py-3.5 outline-none text-sm font-bold text-slate-600 appearance-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden min-h-[400px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                        <div className="w-14 h-14 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-black text-xs tracking-[0.2em] uppercase">Synchronizing Records...</p>
                    </div>
                ) : filteredVendors.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            {statusFilter === 'INACTIVE' ? <CheckCircle2 size={36} className="text-emerald-200" /> : <ShieldAlert size={36} className="text-slate-200" />}
                        </div>
                        <h3 className="text-lg font-black text-slate-800">
                             {statusFilter === 'INACTIVE' ? "No Inactive Vendors" : "No Vendors Found"}
                        </h3>
                        <p className="text-slate-400 text-sm font-medium max-w-xs mt-2">
                            {searchQuery ? `We couldn't find any results matching "${searchQuery}".` : `There are no ${statusFilter.toLowerCase() || 'registered'} vendors in the system currently.`}
                        </p>
                        {(searchQuery || statusFilter) && (
                            <button 
                                onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                                className="mt-6 text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700 underline underline-offset-8"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none">Vendor Identity</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none">Status</th>
                                    <th className="px-8 py-6 text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none">Outstanding Balance</th>
                                    <th className="px-8 py-6 text-right text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-8 py-5">
                                            <button 
                                                onClick={() => setHistoryEntityId(vendor._id)}
                                                className="flex items-center gap-4 group/item text-left transition-all hover:scale-[1.01]"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm uppercase group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                                    {vendor.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight group-hover/item:text-indigo-600 transition-colors">{vendor.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter">PAN: {vendor.pan}</span>
                                                        <span className="text-[10px] text-slate-300">|</span>
                                                        <span className="text-[10px] font-medium text-slate-400 group-hover/item:text-slate-500">{vendor.email || 'No Email'}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-8 py-5">
                                            <button 
                                                onClick={() => setConfirmStatusData({ 
                                                    vendor, 
                                                    newStatus: vendor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' 
                                                })}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
                                                    vendor.status === 'ACTIVE' 
                                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                                {vendor.status}
                                            </button>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className={`text-sm font-black ${vendor.balance < 0 ? 'text-rose-600' : vendor.balance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {settings.currencySymbol} {Math.abs(vendor.balance || 0).toLocaleString()}
                                                <span className="text-[10px] ml-1 font-bold uppercase opacity-60">
                                                    {vendor.balance < 0 ? '(Payable)' : vendor.balance > 0 ? '(Credit)' : ''}
                                                </span>
                                            </p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setActiveVendor(vendor); setIsModalOpen(true); }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                    title="Edit Vendor"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                {vendor.contactNumber && (
                                                    <a href={`tel:${vendor.contactNumber}`} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                                                        <Phone size={18} />
                                                    </a>
                                                )}
                                                {vendor.email && (
                                                    <a href={`mailto:${vendor.email}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                        <Mail size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddVendorModal
                    editData={activeVendor}
                    onClose={() => setIsModalOpen(false)}
                    refreshData={() => {
                        fetchVendors();
                        triggerToast(activeVendor ? "Vendor details updated" : "New vendor registered");
                    }}
                />
            )}

            {historyEntityId && (
                <EntityHistoryModal
                    type="vendor"
                    entityId={historyEntityId}
                    onClose={() => setHistoryEntityId(null)}
                />
            )}

            <ConfirmDialog
                isOpen={!!confirmStatusData}
                title={confirmStatusData?.newStatus === 'ACTIVE' ? 'Restore Vendor' : 'Suspend Vendor'}
                message={`Are you sure you want to ${confirmStatusData?.newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} ${confirmStatusData?.vendor?.name}? Internal references will remain intact.`}
                confirmText={confirmStatusData?.newStatus === 'ACTIVE' ? 'Confirm Activation' : 'Confirm Suspension'}
                confirmColor={confirmStatusData?.newStatus === 'ACTIVE' ? 'emerald' : 'rose'}
                onConfirm={handleToggleStatus}
                onCancel={() => setConfirmStatusData(null)}
            />

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default VendorManagement;

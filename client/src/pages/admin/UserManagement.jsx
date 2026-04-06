import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, ShieldCheck, Mail, ShieldAlert, UserPlus, Trash2, Edit3, CheckCircle2, XCircle } from 'lucide-react';
import API from '../../api/axiosConfig';
import AddUserModal from './modals/AddUserModal';
import EntityHistoryModal from '../../components/modals/EntityHistoryModal';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const UserManagement = ({ type = 'employee', title = 'User Directory' }) => {
    const [users, setUsers] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmStatusData, setConfirmStatusData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [historyEntityId, setHistoryEntityId] = useState(null);

    useEffect(() => { fetchUsers(); }, [type]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const query = type === 'student' ? 'role=STUDENT' : 'excludeRole=STUDENT';
            const { data } = await API.get(`/users?${query}`);
            setUsers(data.data || data.users || (Array.isArray(data) ? data : []));
        } catch (err) { 
            console.error(err); 
            triggerToast("Failed to load user records", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleToggleStatus = async () => {
        if (!confirmStatusData) return;
        const { user, newStatus } = confirmStatusData;

        try {
            await API.patch(`/users/${user._id}/status`, { status: newStatus });
            fetchUsers();
            triggerToast(`${type.charAt(0).toUpperCase() + type.slice(1)} ${newStatus.toLowerCase()} successfully`, "warning");
        } catch (err) {
            triggerToast(err.response?.data?.message || "Status update failed", "error");
        } finally {
            setConfirmStatusData(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === '' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100/50">
                            {type === 'student' ? <Users size={24} /> : <ShieldCheck size={24} />}
                        </div>
                        {title}
                    </h2>
                    <p className="text-slate-500 font-medium mt-1.5 ml-1">
                        Viewing {users.length} {type === 'student' ? 'registered students' : 'active staff members'}.
                    </p>
                </div>
                <button
                    onClick={() => { setActiveUser(null); setIsModalOpen(true); }}
                    className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                    <UserPlus size={18} />
                    {type === 'student' ? 'Register Student' : 'Invite Employee'}
                </button>
            </div>

            {/* Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder={`Search ${type}s by name or email...`}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-semibold text-sm shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select 
                        className="w-full pl-12 pr-8 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm shadow-sm appearance-none text-slate-700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Account Statuses</option>
                        <option value="ACTIVE">Active Users</option>
                        <option value="INACTIVE">Inactive / Suspended</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-100/50 overflow-hidden min-h-[500px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-6" />
                        <p className="text-slate-400 font-black text-xs tracking-[0.3em] uppercase">Retrieving Directory...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-16 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                            {statusFilter === 'INACTIVE' ? <CheckCircle2 size={42} className="text-emerald-200" /> : <ShieldAlert size={42} className="text-slate-200" />}
                        </div>
                        <h3 className="text-xl font-black text-slate-800">
                            {statusFilter === 'INACTIVE' ? `No Inactive ${type.charAt(0).toUpperCase() + type.slice(1)}s` : `No ${type}s Found`}
                        </h3>
                        <p className="text-slate-400 font-medium max-w-sm mt-3 leading-relaxed">
                            {searchQuery ? `We couldn't find any results matching "${searchQuery}".` : `There are no ${statusFilter.toLowerCase() || 'registered'} ${type}s in the system currently.`}
                        </p>
                        {(searchQuery || statusFilter) && (
                            <button 
                                onClick={() => { setSearchQuery(''); setStatusFilter(''); }}
                                className="mt-8 text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700 underline underline-offset-8"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-7 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] leading-none">Identity Information</th>
                                    <th className="px-10 py-7 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] leading-none">Branch</th>
                                    <th className="px-10 py-7 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] leading-none">Account Status</th>
                                    <th className="px-10 py-7 text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] leading-none">System Role</th>
                                    <th className="px-10 py-7 text-right text-[11px] font-black uppercase text-slate-400 tracking-[0.15em] leading-none">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-10 py-6">
                                            <button 
                                                onClick={() => setHistoryEntityId(user._id)}
                                                className="flex items-center gap-5 group/item text-left hover:scale-[1.01] transition-all"
                                            >
                                                <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-base shadow-sm ring-1 ring-indigo-100 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-all">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 tracking-tight leading-tight group-hover/item:text-indigo-600 transition-colors">{user.name}</p>
                                                    <div className="flex items-center gap-2 mt-1.5 capitalize text-slate-400 text-xs font-semibold">
                                                        <Mail size={14} className="text-slate-300" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </button>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <Filter size={12} />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-700 tracking-widest uppercase">
                                                    {user.branch || 'None'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest uppercase ${
                                                user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-rose-50 text-rose-600 ring-1 ring-rose-100'
                                            }`}>
                                                <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                                {user.status}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-[10px] font-black text-slate-500 tracking-[0.1em] uppercase bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end items-center gap-2  transition-opacity">
                                                <button
                                                    onClick={() => { setActiveUser(user); setIsModalOpen(true); }}
                                                    className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                                                    title="Edit User"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                {user.role !== 'SUPERADMIN' ? (
                                                    <button
                                                        onClick={() => setConfirmStatusData({ 
                                                            user, 
                                                            newStatus: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' 
                                                        })}
                                                        className={`p-3 rounded-2xl transition-all ${
                                                            user.status === 'ACTIVE' ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                        }`}
                                                        title={user.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
                                                    >
                                                        {user.status === 'ACTIVE' ? <Trash2 size={18} /> : <CheckCircle2 size={18} />}
                                                    </button>
                                                ) : (
                                                    <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                                                        <ShieldCheck size={16} className="text-slate-300" />
                                                    </div>
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
                <AddUserModal
                    type={type}
                    editData={activeUser}
                    onClose={() => setIsModalOpen(false)}
                    refreshData={() => {
                        fetchUsers();
                        triggerToast(activeUser ? "Account settings updated" : "New user identity established");
                    }}
                />
            )}

            {historyEntityId && (
                <EntityHistoryModal
                    type={type === 'student' ? 'student' : 'employee'}
                    entityId={historyEntityId}
                    onClose={() => setHistoryEntityId(null)}
                />
            )}

            <ConfirmDialog
                isOpen={!!confirmStatusData}
                title={confirmStatusData?.newStatus === 'ACTIVE' ? 'Reactivate Identifier' : 'Suspend Access'}
                message={`You are about to modify ${confirmStatusData?.user?.name}'s directory status to ${confirmStatusData?.newStatus}. Audit logs will be preserved.`}
                confirmText={confirmStatusData?.newStatus === 'ACTIVE' ? 'Restore Access' : 'Terminate Access'}
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

export default UserManagement;
import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';
import AddUserModal from './modals/AddUserModal';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/shared/ConfirmDialog';

const UserManagement = ({ type = 'employee', title = 'User Directory' }) => {
    const [users, setUsers] = useState([]);
    const [activeUser, setActiveUser] = useState(null); // Used for Editing
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmStatusData, setConfirmStatusData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { fetchUsers(); }, [type]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const query = type === 'student' ? 'role=STUDENT' : 'excludeRole=STUDENT';
            const { data } = await API.get(`/users?${query}`);
            setUsers(data.data || data.users || (Array.isArray(data) ? data : []));
        } catch (err) { 
            console.error(err); 
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
            triggerToast(`User ${newStatus.toLowerCase()} successfully`, "warning");
        } catch (err) {
            triggerToast(err.response?.data?.message || "Status update failed", "error");
        } finally {
            setConfirmStatusData(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
                <button
                    onClick={() => { setActiveUser(null); setIsModalOpen(true); }}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 text-sm"
                >
                    {type === 'student' ? 'Register Student' : 'Invite Employee'}
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12">
                        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching Records...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">User Details</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Role</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Management</th>
                            </tr>
                        </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        ● {user.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 uppercase text-[10px] font-black text-slate-500">{user.role}</td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={() => { setActiveUser(user); setIsModalOpen(true); }}
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                                        >
                                            Edit
                                        </button>
                                        {/* HIDE REMOVE BUTTON FOR SUPERADMINS */}
                                        {user.role !== 'SUPERADMIN' ? (
                                            <button
                                                onClick={() => setConfirmStatusData({ 
                                                    user, 
                                                    newStatus: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' 
                                                })}
                                                className="text-slate-300 hover:text-red-500 text-sm font-semibold transition-colors"
                                            >
                                                {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold uppercase py-1">System Protected</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>

            {isModalOpen && (
                <AddUserModal
                    type={type}
                    editData={activeUser}
                    onClose={() => setIsModalOpen(false)}
                    refreshData={() => {
                        fetchUsers();
                        triggerToast(activeUser ? "User updated" : "User created");
                    }}
                />
            )}

            <ConfirmDialog
                isOpen={!!confirmStatusData}
                title={confirmStatusData?.newStatus === 'ACTIVE' ? 'Activate User' : 'Deactivate User'}
                message={`Are you sure you want to set ${confirmStatusData?.user?.name}'s status to ${confirmStatusData?.newStatus}?`}
                confirmText={confirmStatusData?.newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'}
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
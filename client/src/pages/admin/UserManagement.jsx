import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/users');

            // Defensive check: Look for data in common places, default to empty array
            const actualData = data.data || data.users || (Array.isArray(data) ? data : []);
            setUsers(actualData);

        } catch (err) {
            console.error("Fetch Users Error:", err);
            setError(err.response?.data?.message || 'Failed to load users');
            setUsers([]); // Reset to empty array on error to prevent crash
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <span className="text-4xl">⚠️</span>
                    <p className="text-red-600 font-bold mt-2">{error}</p>
                    <button
                        onClick={fetchUsers}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">User Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage system users and permissions</p>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                    ➕ Add New User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard label="Total Users" value={Array.isArray(users) ? users.length : 0} color="blue" />
                <StatCard
                    label="Receptionists"
                    value={Array.isArray(users) ? users.filter(u => u.role === 'RECEPTIONIST').length : 0}
                    color="emerald"
                />
                <StatCard
                    label="Approvers"
                    value={users.filter(u => u.role === 'APPROVER').length}
                    color="purple"
                />
                <StatCard
                    label="Auditor"
                    value={Array.isArray(users) ? users.filter(u => u.role === 'AUDITOR').length : 0}
                    color="emerald"
                />
                <StatCard
                    label="Admins"
                    value={users.filter(u => u.role === 'SUPERADMIN').length}
                    color="rose"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black uppercase text-slate-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-lg font-bold text-blue-600">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.name}</p>
                                                <p className="text-xs text-slate-500">ID: {user._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${user.role === 'SUPERADMIN' ? 'bg-rose-100 text-rose-600' :
                                                user.role === 'APPROVER' ? 'bg-purple-100 text-purple-600' :
                                                    user.role === 'RECEPTIONIST' ? 'bg-emerald-100 text-emerald-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-600">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">
                                                Edit
                                            </button>
                                            <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {users.length === 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                    <span className="text-6xl">👥</span>
                    <p className="text-slate-500 font-bold mt-4">No users found</p>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <p className={`text-xs font-black uppercase text-${color}-400`}>{label}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-2">{value}</h3>
    </div>
);

export default UserManagement;
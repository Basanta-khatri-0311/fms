import React, { useState, useEffect } from 'react';
import API from '../../api/axiosConfig';

const PendingQueue = () => {
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch only "Pending" entries for the Approver to review [cite: 34, 63]
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { data } = await API.get('/incomes'); // Adjust based on your API
        setPendingEntries(data);
      } catch (err) {
        console.error("Error fetching queue", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Approver: Pending Queue</h2>
        <p className="text-sm text-slate-500">Review entries before posting to ledger[cite: 39].</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-slate-600">Date</th>
              <th className="p-4 font-semibold text-slate-600">Client/Party</th>
              <th className="p-4 font-semibold text-slate-600">Type</th>
              <th className="p-4 font-semibold text-slate-600">Amount</th>
              <th className="p-4 font-semibold text-slate-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center">Loading pending tasks...</td></tr>
            ) : pendingEntries.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">No pending entries to review.</td></tr>
            ) : (
              pendingEntries.map((entry) => (
                <tr key={entry._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">{new Date(entry.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{entry.name || entry.partyName}</td>
                  <td className="p-4 text-xs font-bold uppercase">{entry.approval.type}</td>
                  <td className="p-4">Rs. {entry.netAmount || entry.netPayable}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold hover:bg-blue-200">
                      View/Edit [cite: 35]
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700">
                      Approve [cite: 36]
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingQueue;
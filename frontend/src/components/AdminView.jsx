import React, { useState, useEffect } from 'react';

export default function AdminView({ API_URL, onUpdate }) {
  const [adminBusinesses, setAdminBusinesses] = useState([]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/businesses`);
      const data = await res.json();
      setAdminBusinesses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/admin/businesses/${id}/status?status=${status}`, {
        method: 'PUT'
      });
      fetchAdminData();
      onUpdate();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Panel - Business Approvals</h2>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700 border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Business Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminBusinesses.map((b) => (
              <tr key={b.id} className="border-b hover:bg-slate-50">
                <td className="p-4 font-mono">{b.id}</td>
                <td className="p-4 font-semibold">{b.name}</td>
                <td className="p-4">{b.category}</td>
                <td className="p-4">{b.location}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    b.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => handleStatus(b.id, 'approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatus(b.id, 'rejected')}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-xs"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

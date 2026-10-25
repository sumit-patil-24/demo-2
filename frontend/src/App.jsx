import React, { useState, useEffect } from 'react';
import CustomerView from './components/CustomerView';
import BusinessView from './components/BusinessView';
import AdminView from './components/AdminView';

export default function App() {
  const [role, setRole] = useState('customer'); // 'customer', 'business', 'admin'
  const [businesses, setBusinesses] = useState([]);
  const API_URL = 'http://localhost:8000/api/v1';

  const fetchBusinesses = async () => {
    try {
      const res = await fetch(`${API_URL}/businesses`);
      const data = await res.json();
      setBusinesses(data);
    } catch (err) {
      console.error("Failed to fetch businesses", err);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [role]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header / Navigation */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-600 text-white font-bold p-2 rounded-lg text-lg">LBH</span>
            <h1 className="text-xl font-bold tracking-tight">LocalBizHub</h1>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setRole('customer')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${role === 'customer' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              Customer View
            </button>
            <button
              onClick={() => setRole('business')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${role === 'business' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              Business Owner View
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${role === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'}`}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {role === 'customer' && <CustomerView businesses={businesses} API_URL={API_URL} />}
        {role === 'business' && <BusinessView API_URL={API_URL} onUpdate={fetchBusinesses} />}
        {role === 'admin' && <AdminView API_URL={API_URL} onUpdate={fetchBusinesses} />}
      </main>
    </div>
  );
}

import React, { useState } from 'react';

export default function CustomerView({ businesses, API_URL }) {
  const [filter, setFilter] = useState({ category: '', location: '' });
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [enquiry, setEnquiry] = useState({ name: '', email: '', message: '' });
  const [sentStatus, setSentStatus] = useState(false);

  const filteredBusinesses = businesses.filter(b => {
    return (
      (filter.category === '' || b.category.toLowerCase().includes(filter.category.toLowerCase())) &&
      (filter.location === '' || b.location.toLowerCase().includes(filter.location.toLowerCase()))
    );
  });

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: selectedBiz.id,
          customer_name: enquiry.name,
          customer_email: enquiry.email,
          message: enquiry.message
        })
      });
      setSentStatus(true);
      setTimeout(() => {
        setSentStatus(false);
        setSelectedBiz(null);
        setEnquiry({ name: '', email: '', message: '' });
      }, 2000);
    } catch (err) {
      alert("Error sending enquiry");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Discover Local Businesses</h2>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border">
        <input
          type="text"
          placeholder="Filter by category (e.g. Bakery, Tech)..."
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by location (e.g. Pune, Mumbai)..."
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={filter.location}
          onChange={(e) => setFilter({ ...filter, location: e.target.value })}
        />
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBusinesses.map((biz) => (
          <div key={biz.id} className="bg-white rounded-xl shadow-sm border p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                {biz.category}
              </span>
              <h3 className="text-lg font-bold mt-2">{biz.name}</h3>
              <p className="text-xs text-slate-500 mb-2">📍 {biz.location}</p>
              <p className="text-sm text-slate-600 mb-4">{biz.description}</p>
            </div>
            <button
              onClick={() => setSelectedBiz(biz)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition"
            >
              View Products & Contact
            </button>
          </div>
        ))}
      </div>

      {/* Detail / Enquiry Modal */}
      {selectedBiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedBiz.name}</h3>
              <button onClick={() => setSelectedBiz(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <h4 className="font-semibold text-sm mb-2 text-slate-700">Products & Services</h4>
            <div className="space-y-2 mb-6">
              {selectedBiz.products?.length === 0 ? (
                <p className="text-xs text-slate-400">No products listed yet.</p>
              ) : (
                selectedBiz.products?.map((p) => (
                  <div key={p.id} className="border p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.description}</p>
                    </div>
                    <span className="font-bold text-sm text-emerald-600">₹{p.price}</span>
                  </div>
                ))
              )}
            </div>

            <hr className="my-4" />

            <h4 className="font-semibold text-sm mb-2 text-slate-700">Submit Enquiry</h4>
            {sentStatus ? (
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm font-medium">
                Enquiry sent successfully!
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full border rounded-lg p-2 text-sm"
                  value={enquiry.name}
                  onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  required
                  className="w-full border rounded-lg p-2 text-sm"
                  value={enquiry.email}
                  onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                />
                <textarea
                  placeholder="Message..."
                  required
                  className="w-full border rounded-lg p-2 text-sm h-20"
                  value={enquiry.message}
                  onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                />
                <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium">
                  Send Enquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

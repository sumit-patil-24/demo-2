import React, { useState } from 'react';

export default function BusinessView({ API_URL, onUpdate }) {
  const [bizForm, setBizForm] = useState({ name: '', category: '', location: '', description: '', owner_id: 1 });
  const [productForm, setProductForm] = useState({ business_id: 1, name: '', price: '', description: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bizForm)
      });
      alert('Business registration submitted! Pending admin approval.');
      onUpdate();
    } catch (err) {
      alert('Failed to register business');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...productForm, price: parseFloat(productForm.price) })
      });
      alert('Product added successfully!');
      onUpdate();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Register Business Form */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4">Register New Business Profile</h3>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Business Name"
            required
            className="w-full border p-2 text-sm rounded-lg"
            value={bizForm.name}
            onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Category (e.g. Retail, Tech, Food)"
            required
            className="w-full border p-2 text-sm rounded-lg"
            value={bizForm.category}
            onChange={(e) => setBizForm({ ...bizForm, category: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location"
            required
            className="w-full border p-2 text-sm rounded-lg"
            value={bizForm.location}
            onChange={(e) => setBizForm({ ...bizForm, location: e.target.value })}
          />
          <textarea
            placeholder="Business Description"
            className="w-full border p-2 text-sm rounded-lg h-24"
            value={bizForm.description}
            onChange={(e) => setBizForm({ ...bizForm, description: e.target.value })}
          />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium">
            Register Business
          </button>
        </form>
      </div>

      {/* Add Product Form */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4">Add Product/Service to Profile</h3>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <input
            type="number"
            placeholder="Business ID"
            required
            className="w-full border p-2 text-sm rounded-lg"
            value={productForm.business_id}
            onChange={(e) => setProductForm({ ...productForm, business_id: parseInt(e.target.value) })}
          />
          <input
            type="text"
            placeholder="Product Name"
            required
            className="w-full border p-2 text-sm rounded-lg"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price (₹)"
            required
            className="w-full border p-2 text-sm rounded-lg"
            value={productForm.price}
            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
          />
          <textarea
            placeholder="Product Description"
            className="w-full border p-2 text-sm rounded-lg h-24"
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium">
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

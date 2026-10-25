// Shapes DB rows into the JSON the React frontend expects
// (see src/data/demo.js and the README contract in the frontend).
const lower = (v) => (v ? v.toLowerCase() : v);

const user = (u) => ({ id: u.id, name: u.name, email: u.email, role: lower(u.role) });

const product = (p) => ({
  id: p.id,
  businessId: p.businessId,
  name: p.name,
  description: p.description ?? '',
  price: Number(p.price),
  image: p.image,
  createdAt: p.createdAt,
});

// includeStatus = true for owner/admin views; public views never expose status.
const business = (b, { includeStatus = false } = {}) => ({
  id: b.id,
  name: b.name,
  category: b.category ? b.category.name : undefined,
  location: b.location,
  description: b.description,
  rating: Number(b.rating),
  image: b.image,
  email: b.email,
  phone: b.phone,
  hours: b.hours,
  createdAt: b.createdAt,
  ...(includeStatus ? { status: lower(b.status) } : {}),
  ...(b.owner ? { owner: { id: b.owner.id, name: b.owner.name, email: b.owner.email } } : {}),
  ...(b.products ? { products: b.products.map(product) } : {}),
});

const enquiry = (e) => ({
  id: e.id,
  businessId: e.businessId,
  businessName: e.business ? e.business.name : undefined,
  name: e.name,
  email: e.email,
  message: e.message,
  status: lower(e.status),
  createdAt: e.createdAt,
});

module.exports = { user, product, business, enquiry, lower };

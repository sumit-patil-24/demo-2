const test = require('node:test');
const assert = require('node:assert/strict');
require('./helpers'); // sets env defaults
const v = require('../src/validators');
const S = require('../src/utils/serialize');

test('register: accepts valid input, lowercases email, defaults role to customer', () => {
  const r = v.register.parse({ name: 'Asha Rao', email: 'ASHA@Example.com', password: 'longenough1' });
  assert.equal(r.email, 'asha@example.com');
  assert.equal(r.role, 'customer');
});

test('register: rejects short password, bad email and admin role', () => {
  assert.equal(v.register.safeParse({ name: 'Asha', email: 'a@b.co', password: 'short' }).success, false);
  assert.equal(v.register.safeParse({ name: 'Asha', email: 'nope', password: 'longenough1' }).success, false);
  assert.equal(v.register.safeParse({ name: 'Asha', email: 'a@b.co', password: 'longenough1', role: 'admin' }).success, false);
});

test('business query: applies defaults and coerces page numbers', () => {
  const q = v.businessQuery.parse({ page: '2', pageSize: '3' });
  assert.deepEqual([q.page, q.pageSize, q.sort, q.q], [2, 3, 'newest', '']);
  assert.equal(v.businessQuery.safeParse({ pageSize: '500' }).success, false);
});

test('enquiry: message must be at least 10 characters', () => {
  const base = { name: 'A', email: 'a@b.co', businessId: 'x' };
  assert.equal(v.enquiryCreate.safeParse({ ...base, message: 'too short' }).success, false);
  assert.equal(v.enquiryCreate.safeParse({ ...base, message: 'this is long enough' }).success, true);
});

test('product: price is rounded to 2 decimals and cannot be negative', () => {
  assert.equal(v.productCreate.parse({ name: 'Tea', price: '10.456' }).price, 10.46);
  assert.equal(v.productCreate.safeParse({ name: 'Tea', price: -1 }).success, false);
});

test('serialize.business: public shape has numeric rating, category name, no status', () => {
  const out = S.business({
    id: 'b1', name: 'X', category: { name: 'Retail' }, location: 'Pune', description: 'd', rating: '4.8',
    image: null, email: null, phone: null, hours: null, status: 'APPROVED', createdAt: new Date(0),
    products: [{ id: 'p1', businessId: 'b1', name: 'P', price: '199.00', image: null, createdAt: new Date(0), description: null }],
  });
  assert.equal(out.category, 'Retail');
  assert.equal(out.rating, 4.8);
  assert.equal(out.products[0].price, 199);
  assert.equal('status' in out, false);
});

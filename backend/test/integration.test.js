// End-to-end flow against a real PostgreSQL. Runs in CI (RUN_DB_TESTS=true); skipped locally unless set.
const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { start } = require('./helpers');

const enabled = process.env.RUN_DB_TESTS === 'true';
const id = Date.now();
const pw = 'Passw0rd!long';
let t; const ctx = {};

test.before(async () => { if (enabled) t = await start(); });
test.after(async () => { if (t) await t.stop(); });

test('health endpoint reports the database as up', { skip: !enabled }, async () => {
  const r = await t.call('GET', '/health');
  assert.equal(r.status, 200);
  assert.equal(r.body.db, 'up');
});

test('full marketplace flow: register -> create -> approve -> discover -> enquire -> manage', { skip: !enabled }, async () => {
  const { prisma, call } = t;
  const cat = await prisma.category.upsert({ where: { name: 'CI Category' }, update: {}, create: { name: 'CI Category' } });
  await prisma.user.create({ data: { name: 'CI Admin', email: `admin${id}@ci.test`, passwordHash: await bcrypt.hash(pw, 4), role: 'ADMIN' } });

  // owner registers and creates a business (pending, so hidden from the public)
  const owner = await call('POST', '/api/auth/register', { body: { name: 'Owner', email: `owner${id}@ci.test`, password: pw, role: 'owner' } });
  assert.equal(owner.status, 201);
  assert.equal(owner.body.user.role, 'owner');
  ctx.owner = owner.body.token;
  const biz = await call('POST', '/api/owner/business', { token: ctx.owner, body: { name: `CI Biz ${id}`, category: cat.name, description: 'A business created by the CI test.', location: 'Pune' } });
  assert.equal(biz.status, 201);
  assert.equal(biz.body.status, 'pending');
  ctx.bizId = biz.body.id;
  assert.equal((await call('GET', `/api/businesses/${ctx.bizId}`)).status, 404);

  // owner adds a product
  const prod = await call('POST', '/api/owner/products', { token: ctx.owner, body: { name: 'CI Product', price: 250 } });
  assert.equal(prod.status, 201);

  // customers cannot use owner/admin routes
  const cust = await call('POST', '/api/auth/register', { body: { name: 'Cust', email: `cust${id}@ci.test`, password: pw } });
  ctx.cust = cust.body.token;
  assert.equal((await call('GET', '/api/owner/business', { token: ctx.cust })).status, 403);
  assert.equal((await call('GET', '/api/admin/stats', { token: ctx.cust })).status, 403);

  // admin approves
  const adm = await call('POST', '/api/auth/login', { body: { email: `admin${id}@ci.test`, password: pw } });
  assert.equal(adm.status, 200);
  ctx.admin = adm.body.token;
  const ok = await call('PATCH', `/api/admin/businesses/${ctx.bizId}/status`, { token: ctx.admin, body: { status: 'approved' } });
  assert.equal(ok.status, 200);

  // public discovery: search, filter, detail with products
  const list = await call('GET', `/api/businesses?q=${encodeURIComponent('CI Biz ' + id)}&category=${encodeURIComponent(cat.name)}&location=pune`);
  assert.equal(list.body.total, 1);
  const detail = await call('GET', `/api/businesses/${ctx.bizId}`);
  assert.equal(detail.body.products.length, 1);
  assert.equal(detail.body.products[0].price, 250);

  // customer submits an enquiry; owner sees it and updates its status
  const enq = await call('POST', '/api/enquiries', { token: ctx.cust, body: { name: 'Cust', email: `cust${id}@ci.test`, message: 'Do you deliver on weekends?', businessId: ctx.bizId } });
  assert.equal(enq.status, 201);
  const inbox = await call('GET', '/api/owner/enquiries', { token: ctx.owner });
  assert.equal(inbox.body.total, 1);
  const upd = await call('PATCH', `/api/owner/enquiries/${inbox.body.items[0].id}`, { token: ctx.owner, body: { status: 'replied' } });
  assert.equal(upd.body.status, 'replied');
  assert.equal((await call('GET', '/api/enquiries/mine', { token: ctx.cust })).body.length, 1);

  // analytics
  const stats = await call('GET', '/api/admin/stats', { token: ctx.admin });
  assert.equal(stats.status, 200);
  assert.ok(stats.body.enquiries.total >= 1);
});

test('login with the wrong password returns 401', { skip: !enabled }, async () => {
  const r = await t.call('POST', '/api/auth/login', { body: { email: `owner${id}@ci.test`, password: 'wrong-password' } });
  assert.equal(r.status, 401);
});

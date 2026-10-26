// Tests that never reach the database (validation + auth guards + routing).
const test = require('node:test');
const assert = require('node:assert/strict');
const { start } = require('./helpers');

let t;
test.before(async () => { t = await start(); });
test.after(async () => { await t.stop(); });

test('unknown route returns JSON 404', async () => {
  const r = await t.call('GET', '/api/does-not-exist');
  assert.equal(r.status, 404);
  assert.ok(r.body.message);
});

test('register with invalid body returns 400 and a message', async () => {
  const r = await t.call('POST', '/api/auth/register', { body: { name: 'A', email: 'bad', password: '1' } });
  assert.equal(r.status, 400);
  assert.ok(r.body.message);
});

test('protected routes reject requests without a token (401)', async () => {
  for (const [m, p] of [['GET', '/api/auth/me'], ['GET', '/api/owner/business'], ['GET', '/api/admin/stats'], ['GET', '/api/enquiries/mine']]) {
    const r = await t.call(m, p);
    assert.equal(r.status, 401, `${m} ${p}`);
  }
});

test('protected routes reject a forged token (401)', async () => {
  const r = await t.call('GET', '/api/admin/stats', { token: 'not.a.jwt' });
  assert.equal(r.status, 401);
});

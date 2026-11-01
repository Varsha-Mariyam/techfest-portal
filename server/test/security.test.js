const { test, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');

let server, base;
before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://localhost:${server.address().port}`; r(); }); }));
after(() => server.close());

const post = (path, body) => fetch(base + path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

test('health check works', async () => {
  const res = await fetch(base + '/api/health');
  assert.strictEqual(res.status, 200);
});

test('Helmet security headers are present', async () => {
  const res = await fetch(base + '/api/health');
  assert.ok(res.headers.get('x-content-type-options'));
  assert.ok(res.headers.get('content-security-policy'));
});

test('NoSQL injection login is rejected', async () => {
  const res = await post('/api/auth/login', { email: { $ne: null }, password: { $ne: null } });
  assert.strictEqual(res.status, 400);
});

test('feedback requires login', async () => {
  const res = await post('/api/feedback', { text: 'hello' });
  assert.strictEqual(res.status, 401);
});

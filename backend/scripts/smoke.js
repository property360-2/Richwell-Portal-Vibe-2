process.env.NODE_ENV = 'test';
const { default: app } = await import('../src/server.js');

const server = app.listen(0, async () => {
  const { port } = server.address();
  try {
    const base = `http://127.0.0.1:${port}`;
    const call = (path, init) => fetch(`${base}${path}`, init);

    // Health
    const r1 = await call('/health');
    console.log('HEALTH', r1.status, await r1.json());

    // Auth-required endpoints should 401 without token
    const r2 = await call('/auth/me');
    console.log('AUTH_ME', r2.status, await r2.json());

    const r3 = await call('/roles/student');
    console.log('ROLE_STUDENT', r3.status, await r3.json());

    const r4 = await call('/registrar/programs');
    console.log('REG_PROGRAMS', r4.status, await r4.json());
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

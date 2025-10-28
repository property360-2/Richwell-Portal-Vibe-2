import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

function parseDatabaseUrl(dsn) {
  const u = new URL(dsn);
  return {
    host: u.hostname,
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, '')
  };
}

async function main() {
  const dsn = process.env.DATABASE_URL;
  if (!dsn) throw new Error('DATABASE_URL not set');
  const cfg = parseDatabaseUrl(dsn);

  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database
  });

  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  const users = [
    { email: 'student@example.com', firstName: 'Samantha', lastName: 'Student', role: 'STUDENT' },
    { email: 'professor@example.com', firstName: 'Peter', lastName: 'Professor', role: 'PROFESSOR' },
    { email: 'registrar@example.com', firstName: 'Rachel', lastName: 'Registrar', role: 'REGISTRAR' },
    { email: 'admission@example.com', firstName: 'Alicia', lastName: 'Admission', role: 'ADMISSION' },
    { email: 'dean@example.com', firstName: 'Derek', lastName: 'Dean', role: 'DEAN' }
  ];

  for (const u of users) {
    // eslint-disable-next-line no-await-in-loop
    await conn.execute(
      `INSERT INTO \`User\` (email, passwordHash, role, firstName, lastName) VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE firstName=VALUES(firstName), lastName=VALUES(lastName), role=VALUES(role), passwordHash=VALUES(passwordHash)`,
      [u.email, passwordHash, u.role, u.firstName, u.lastName]
    );
  }

  await conn.end();
  console.log('Seeded minimal users with default password: ChangeMe123!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


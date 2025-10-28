import mysql from 'mysql2/promise';

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
    database: cfg.database,
    multipleStatements: true
  });

  // Create essential tables to enable login/session flow
  const sql = `
CREATE TABLE IF NOT EXISTS \`User\` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  passwordHash VARCHAR(191) NOT NULL,
  role ENUM('STUDENT','PROFESSOR','REGISTRAR','ADMISSION','DEAN') NOT NULL,
  firstName VARCHAR(191) NOT NULL,
  lastName VARCHAR(191) NOT NULL,
  status VARCHAR(191) NOT NULL DEFAULT 'active',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE IF NOT EXISTS \`Session\` (
  tokenHash VARCHAR(191) PRIMARY KEY,
  userId INT NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  revokedAt DATETIME(3) NULL,
  CONSTRAINT \`Session_userId_fkey\` FOREIGN KEY (userId) REFERENCES \`User\` (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS \`PasswordResetToken\` (
  tokenHash VARCHAR(191) PRIMARY KEY,
  userId INT NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expiresAt DATETIME(3) NOT NULL,
  usedAt DATETIME(3) NULL,
  CONSTRAINT \`PasswordResetToken_userId_fkey\` FOREIGN KEY (userId) REFERENCES \`User\` (id) ON DELETE CASCADE
);
`;

  await conn.query(sql);
  await conn.end();
  console.log('Minimal tables created (User, Session, PasswordResetToken).');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { query } = require('./db');

async function migrate() {
  const isMySQL = !!process.env.DB_HOST;
  console.log('Running visitors migration (' + (isMySQL ? 'MySQL' : 'MSSQL') + ')...');

  if (isMySQL) {
    await query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        visitor_id  VARCHAR(255)  NOT NULL UNIQUE,
        name        VARCHAR(100)  DEFAULT NULL,
        email       VARCHAR(150)  DEFAULT NULL,
        first_visit DATETIME      DEFAULT CURRENT_TIMESTAMP,
        last_visit  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        visit_count INT           DEFAULT 1,
        user_agent  VARCHAR(500)  DEFAULT NULL,
        ip_address  VARCHAR(100)  DEFAULT NULL,
        INDEX idx_email       (email),
        INDEX idx_first_visit (first_visit),
        INDEX idx_last_visit  (last_visit)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } else {
    await query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='visitors' AND xtype='U')
      CREATE TABLE visitors (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        visitor_id  NVARCHAR(255) NOT NULL UNIQUE,
        name        NVARCHAR(100) NULL,
        email       NVARCHAR(150) NULL,
        first_visit DATETIME2     DEFAULT GETDATE(),
        last_visit  DATETIME2     DEFAULT GETDATE(),
        visit_count INT           DEFAULT 1,
        user_agent  NVARCHAR(500) NULL,
        ip_address  NVARCHAR(100) NULL
      )
    `);
  }

  console.log('✅ visitors table ready.');
  process.exit(0);
}

migrate().catch(e => {
  console.error('❌ Migration failed:', e.message);
  process.exit(1);
});

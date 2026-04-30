require('dotenv').config();
const { query } = require('./db');

async function migrate() {
  const isMySQL = !!process.env.DB_HOST;
  console.log('Running analytics migration (' + (isMySQL ? 'MySQL' : 'MSSQL') + ')...');

  if (isMySQL) {
    await query(`
      CREATE TABLE IF NOT EXISTS page_visits (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        page       VARCHAR(255)  NOT NULL,
        ip_hash    VARCHAR(32)   DEFAULT NULL,
        user_agent VARCHAR(500)  DEFAULT NULL,
        referrer   VARCHAR(500)  DEFAULT NULL,
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created_at (created_at),
        INDEX idx_page       (page)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } else {
    await query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='page_visits' AND xtype='U')
      CREATE TABLE page_visits (
        id         INT IDENTITY(1,1) PRIMARY KEY,
        page       NVARCHAR(255) NOT NULL,
        ip_hash    NVARCHAR(32)  NULL,
        user_agent NVARCHAR(500) NULL,
        referrer   NVARCHAR(500) NULL,
        created_at DATETIME2     DEFAULT GETDATE()
      )
    `);
  }

  console.log('✅ page_visits table ready.');
  process.exit(0);
}

migrate().catch(e => {
  console.error('❌ Migration failed:', e.message);
  process.exit(1);
});

const sql = require('mssql');
require('dotenv').config();

const config = {
  server:   process.env.DB_SERVER   || 'VIKRAM',
  database: process.env.DB_DATABASE || 'vtechzone',
  port:     parseInt(process.env.DB_PORT) || 1433,
  user:     process.env.DB_USER     || 'sa',
  password: process.env.DB_PASSWORD || 'sa@123',
  options: {
    encrypt:                false,
    trustServerCertificate: true,
    enableArithAbort:       true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 30000,
  requestTimeout:    30000,
};

let pool;

async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log('✅ Connected to SQL Server:', config.server, '/', config.database);
    } catch (err) {
      console.error('❌ SQL Server connection failed:', err.message);
      throw err;
    }
  }
  return pool;
}

module.exports = { getPool, sql };

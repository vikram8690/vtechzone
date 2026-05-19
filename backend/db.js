require('dotenv').config();

/* ----------------------------------------------------------------
   Unified DB driver — auto-detects driver from env vars
   PostgreSQL : set DATABASE_URL  (Render)
   MySQL      : set DB_HOST       (AWS RDS)
   MSSQL      : fallback          (local dev / SQL Server)
---------------------------------------------------------------- */

let queryFn;
let dbType;

if (process.env.DATABASE_URL) {
  /* ---- PostgreSQL (Render) ---- */
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  dbType = 'pg';
  console.log('DB driver: PostgreSQL (Render)');

  const toPositional = sql => { let i = 0; return sql.replace(/\?/g, () => `$${++i}`); };

  queryFn = async (sqlText, params = []) => {
    const result = await pool.query(toPositional(sqlText), params);
    return { recordset: result.rows };
  };

} else if (process.env.DB_HOST) {
  /* ---- MySQL (AWS RDS) ---- */
  const mysql = require('mysql2/promise');
  const pool  = mysql.createPool({
    host:               process.env.DB_HOST,
    port:               parseInt(process.env.DB_PORT) || 3306,
    user:               process.env.DB_USER,
    password:           process.env.DB_PASSWORD,
    database:           process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit:    10,
    ssl:                { rejectUnauthorized: false },
  });
  dbType = 'mysql';
  console.log('DB driver: MySQL @', process.env.DB_HOST);

  queryFn = async (sqlText, params = []) => {
    const [rows] = await pool.execute(sqlText, params);
    return { recordset: rows };
  };

} else {
  /* ---- MSSQL (local dev) ---- */
  const mssql  = require('mssql');
  const config = {
    server:   process.env.DB_SERVER   || 'VIKRAM',
    database: process.env.DB_DATABASE || 'vtechzone',
    port:     parseInt(process.env.DB_PORT) || 1433,
    user:     process.env.DB_USER     || 'sa',
    password: process.env.DB_PASSWORD || 'sa@123',
    options:  { encrypt: false, trustServerCertificate: true, enableArithAbort: true },
    pool:     { max: 10, min: 0, idleTimeoutMillis: 30000 },
    connectionTimeout: 30000,
    requestTimeout:    30000,
  };
  dbType = 'mssql';
  let pool;
  async function getPool() {
    if (!pool) {
      pool = await mssql.connect(config);
      console.log('DB driver: MSSQL @', config.server, '/', config.database);
    }
    return pool;
  }

  queryFn = async (sqlText, params = []) => {
    const p   = await getPool();
    const req = p.request();
    let idx = 0;
    const converted = sqlText.replace(/\?/g, () => '@p' + idx++);
    params.forEach((val, i) => req.input('p' + i, val));
    return req.query(converted);
  };
}

module.exports = { query: queryFn, dbType };

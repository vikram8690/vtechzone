require('dotenv').config();

/* ----------------------------------------------------------------
   Unified DB driver — auto-detects MySQL vs MSSQL from env vars
   MySQL  : set DB_HOST (production / AWS RDS)
   MSSQL  : set DB_SERVER (local dev / SQL Server)
---------------------------------------------------------------- */

let queryFn;

if (process.env.DB_HOST) {
  /* ---- MySQL (production) ---- */
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
    /* convert ? placeholders → @p0, @p1 … */
    const converted = sqlText.replace(/\?/g, () => '@p' + idx++);
    params.forEach((val, i) => req.input('p' + i, val));
    return req.query(converted);   /* returns { recordset: [] } */
  };
}

module.exports = { query: queryFn };

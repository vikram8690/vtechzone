/**
 * vTechZone — SQL Server Connection Tester
 * Run:  node test-connection.js
 * This tries every possible connection method automatically.
 */

require('dotenv').config();
const sql = require('mssql');

const SERVER   = process.env.DB_SERVER   || 'VIKRAM';
const DATABASE = process.env.DB_DATABASE || 'vtechzone';
const SA_PASS  = process.env.DB_PASSWORD || 'Sa@123456';

// All combinations to try
const attempts = [
  {
    label: '1. VIKRAM  (SQL Auth, port 1433)',
    cfg: { server:'VIKRAM', port:1433, user:'sa', password:SA_PASS, database:'master',
           options:{ encrypt:false, trustServerCertificate:true, enableArithAbort:true },
           connectionTimeout:4000 }
  },
  {
    label: '2. VIKRAM\\SQLEXPRESS  (SQL Auth, port 1433)',
    cfg: { server:'VIKRAM\\SQLEXPRESS', port:1433, user:'sa', password:SA_PASS, database:'master',
           options:{ encrypt:false, trustServerCertificate:true, enableArithAbort:true },
           connectionTimeout:4000 }
  },
  {
    label: '3. localhost  (SQL Auth, port 1433)',
    cfg: { server:'localhost', port:1433, user:'sa', password:SA_PASS, database:'master',
           options:{ encrypt:false, trustServerCertificate:true, enableArithAbort:true },
           connectionTimeout:4000 }
  },
  {
    label: '4. 127.0.0.1  (SQL Auth, port 1433)',
    cfg: { server:'127.0.0.1', port:1433, user:'sa', password:SA_PASS, database:'master',
           options:{ encrypt:false, trustServerCertificate:true, enableArithAbort:true },
           connectionTimeout:4000 }
  },
  {
    label: '5. localhost\\SQLEXPRESS  (SQL Auth, port 1433)',
    cfg: { server:'localhost\\SQLEXPRESS', port:1433, user:'sa', password:SA_PASS, database:'master',
           options:{ encrypt:false, trustServerCertificate:true, enableArithAbort:true },
           connectionTimeout:4000 }
  },
  {
    label: '6. VIKRAM  (SQL Auth, NO port — named pipe)',
    cfg: { server:'VIKRAM', user:'sa', password:SA_PASS, database:'master',
           options:{ encrypt:false, trustServerCertificate:true, enableArithAbort:true },
           connectionTimeout:4000 }
  },
];

async function tryOne(attempt) {
  let pool;
  try {
    pool = await sql.connect(attempt.cfg);
    await pool.close();
    return true;
  } catch(e) {
    try { if(pool) await pool.close(); } catch(_){}
    return false;
  }
}

async function run() {
  console.log('============================================');
  console.log(' vTechZone — SQL Server Connection Tester');
  console.log('============================================');
  console.log('sa password being tested:', SA_PASS);
  console.log('');

  let found = null;

  for (const attempt of attempts) {
    process.stdout.write('Testing ' + attempt.label + ' ... ');
    const ok = await tryOne(attempt);
    if (ok) {
      console.log('✅ SUCCESS!');
      found = attempt;
      break;
    } else {
      console.log('❌ failed');
    }
  }

  console.log('');

  if (found) {
    const s = found.cfg.server;
    const p = found.cfg.port;
    console.log('════════════════════════════════════════════');
    console.log('  WORKING CONFIGURATION FOUND!');
    console.log('  Update your .env file with:');
    console.log('');
    console.log('  DB_SERVER='   + s);
    if (p) console.log('  DB_PORT='     + p);
    console.log('  DB_USER=sa');
    console.log('  DB_PASSWORD=' + SA_PASS);
    console.log('  DB_DATABASE=vtechzone');
    console.log('════════════════════════════════════════════');
    console.log('');
    console.log('Then restart:  npm start');
  } else {
    console.log('════════════════════════════════════════════');
    console.log('  NO CONNECTION WORKED.');
    console.log('');
    console.log('  Please check:');
    console.log('  1. SQL Server service is Running');
    console.log('     → Win+R → services.msc → SQL Server (MSSQLSERVER or SQLEXPRESS)');
    console.log('');
    console.log('  2. TCP/IP is Enabled');
    console.log('     → Win+R → SQLServerManager16.msc');
    console.log('     → SQL Server Network Configuration');
    console.log('     → Protocols → TCP/IP → Enable → Restart SQL Server');
    console.log('');
    console.log('  3. sa login is Enabled with password: ' + SA_PASS);
    console.log('     → SSMS → Security → Logins → sa → Properties');
    console.log('     → Status → Login: Enabled');
    console.log('     → General → set password to: ' + SA_PASS);
    console.log('');
    console.log('  4. Server Authentication is set to SQL+Windows mode');
    console.log('     → SSMS → right-click server → Properties → Security');
    console.log('     → SQL Server and Windows Authentication mode');
    console.log('════════════════════════════════════════════');
  }
  process.exit(0);
}

run();

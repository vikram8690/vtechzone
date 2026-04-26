/**
 * Tests DB connection + checks admin account
 * Run:  node test-login.js
 */
require('dotenv').config();
const sql    = require('mssql');
const bcrypt = require('bcryptjs');

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
  connectionTimeout: 15000,
};

async function run() {
  console.log('');
  console.log('=== vTechZone Connection + Admin Test ===');
  console.log('Server  :', config.server);
  console.log('Database:', config.database);
  console.log('User    :', config.user);
  console.log('Password:', config.password);
  console.log('');

  let pool;
  try {
    process.stdout.write('Connecting... ');
    pool = await sql.connect(config);
    console.log('✅ Connected!\n');
  } catch (err) {
    console.log('❌ FAILED\n');
    console.log('Error:', err.message);
    console.log('');
    console.log('Check:');
    console.log('  1. SQL Server is running  (services.msc)');
    console.log('  2. TCP/IP is enabled      (SQLServerManager16.msc)');
    console.log('  3. netstat -ano | findstr 1433  shows a result');
    process.exit(1);
  }

  // Check users table
  try {
    process.stdout.write('Checking users table... ');
    const r = await pool.request().query('SELECT COUNT(*) AS cnt FROM users');
    console.log('✅ Found', r.recordset[0].cnt, 'user(s)\n');
  } catch (err) {
    console.log('❌ users table missing — run database_setup.sql first\n');
    process.exit(1);
  }

  // Check admin account
  try {
    process.stdout.write('Checking admin account... ');
    const r = await pool.request()
      .input('role', sql.VarChar, 'admin')
      .query('SELECT id, name, email, password, role FROM users WHERE role = @role');

    if (r.recordset.length === 0) {
      console.log('❌ No admin found\n');
      console.log('Fix: Run this SQL in SSMS:\n');
      const hash = bcrypt.hashSync('Admin@123', 12);
      console.log(`USE vtechzone;`);
      console.log(`DELETE FROM users WHERE email = 'techzone.it.2025@gmail.com';`);
      console.log(`INSERT INTO users (name, email, password, role)`);
      console.log(`VALUES ('Admin', 'techzone.it.2025@gmail.com', '${hash}', 'admin');`);
      process.exit(1);
    }

    const admin = r.recordset[0];
    console.log('✅ Found:', admin.email, '| role:', admin.role, '\n');

    // Verify password hash
    process.stdout.write('Verifying password hash... ');
    if (!admin.password) {
      console.log('❌ Password is empty in database!\n');
    } else {
      const ok = bcrypt.compareSync('Admin@123', admin.password);
      if (ok) {
        console.log('✅ Password hash is CORRECT!\n');
        console.log('═══════════════════════════════════════');
        console.log('  Everything is working!');
        console.log('  Login at: http://localhost:5000/login.html');
        console.log('  Email   : ' + admin.email);
        console.log('  Password: Admin@123');
        console.log('═══════════════════════════════════════');
      } else {
        console.log('❌ Password hash does NOT match Admin@123\n');
        console.log('Fix: Run this SQL in SSMS to reset password:\n');
        const newHash = bcrypt.hashSync('Admin@123', 12);
        console.log(`USE vtechzone;`);
        console.log(`UPDATE users SET password = '${newHash}'`);
        console.log(`WHERE email = '${admin.email}';`);
        console.log('');
        console.log('Then restart server: npm start');
      }
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  await pool.close();
  process.exit(0);
}

run();

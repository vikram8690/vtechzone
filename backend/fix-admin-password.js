/**
 * vTechZone — Fix Admin Password
 * Run this file ONCE inside your backend/ folder:
 *   node fix-admin-password.js
 *
 * It will:
 *  1. Hash the password you set below
 *  2. Update the admin row in SQL Server
 *  3. Print "Done!" when finished
 */

require('dotenv').config();
const bcrypt   = require('bcryptjs');
const sql      = require('mssql');

// ── CHANGE THESE IF YOU WANT ──────────────────────
const ADMIN_EMAIL    = 'techzone.it.2025@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME     = 'Admin';
// ─────────────────────────────────────────────────

const config = {
  server:   process.env.DB_SERVER   || 'VIKRAM',
  database: process.env.DB_DATABASE || 'vtechzone',
  port:     parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    trustedConnection:   true,
    integratedSecurity:  true,
  },
  ...(process.env.DB_USER ? {
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options:  { encrypt: false, trustServerCertificate: true }
  } : {})
};

async function run() {
  try {
    console.log('Connecting to SQL Server...');
    const pool = await sql.connect(config);
    console.log('Connected!');

    // Hash the password fresh
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    console.log('Password hashed.');

    // Check if admin already exists
    const check = await pool.request()
      .input('email', sql.VarChar, ADMIN_EMAIL)
      .query('SELECT id FROM users WHERE email = @email');

    if (check.recordset.length > 0) {
      // Update existing
      await pool.request()
        .input('email',    sql.VarChar, ADMIN_EMAIL)
        .input('password', sql.VarChar, hashed)
        .input('role',     sql.VarChar, 'admin')
        .input('name',     sql.VarChar, ADMIN_NAME)
        .query(`UPDATE users
                SET password=@password, role=@role, name=@name
                WHERE email=@email`);
      console.log('✅ Admin password UPDATED successfully!');
    } else {
      // Insert new admin
      await pool.request()
        .input('name',     sql.VarChar, ADMIN_NAME)
        .input('email',    sql.VarChar, ADMIN_EMAIL)
        .input('password', sql.VarChar, hashed)
        .input('role',     sql.VarChar, 'admin')
        .query(`INSERT INTO users (name, email, password, role)
                VALUES (@name, @email, @password, @role)`);
      console.log('✅ Admin account CREATED successfully!');
    }

    console.log('');
    console.log('Login with:');
    console.log('  Email    :', ADMIN_EMAIL);
    console.log('  Password :', ADMIN_PASSWORD);
    console.log('');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();

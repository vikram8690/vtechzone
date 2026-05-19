require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log('Running PostgreSQL migrations...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100)  NOT NULL,
      email      VARCHAR(150)  NOT NULL UNIQUE,
      password   VARCHAR(255)  NOT NULL,
      role       VARCHAR(20)   NOT NULL DEFAULT 'user',
      created_at TIMESTAMP     DEFAULT NOW()
    )
  `);
  console.log('✓ users');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100)  NOT NULL,
      email      VARCHAR(150)  NOT NULL,
      message    TEXT          NOT NULL,
      created_at TIMESTAMP     DEFAULT NOW()
    )
  `);
  console.log('✓ messages');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(200)  NOT NULL,
      description TEXT          NOT NULL,
      image       VARCHAR(100)  NOT NULL DEFAULT '',
      created_at  TIMESTAMP     DEFAULT NOW()
    )
  `);
  console.log('✓ services');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(200)  NOT NULL,
      technology  VARCHAR(200)  NOT NULL,
      description TEXT,
      created_at  TIMESTAMP     DEFAULT NOW()
    )
  `);
  console.log('✓ projects');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_visits (
      id         SERIAL PRIMARY KEY,
      page       VARCHAR(255)  NOT NULL,
      ip_hash    VARCHAR(32),
      user_agent VARCHAR(500),
      referrer   VARCHAR(500),
      created_at TIMESTAMP     DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pv_created_at ON page_visits (created_at)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_pv_page ON page_visits (page)`);
  console.log('✓ page_visits');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS visitors (
      id          SERIAL PRIMARY KEY,
      visitor_id  VARCHAR(255)  NOT NULL UNIQUE,
      name        VARCHAR(100),
      email       VARCHAR(150),
      first_visit TIMESTAMP     DEFAULT NOW(),
      last_visit  TIMESTAMP     DEFAULT NOW(),
      visit_count INT           DEFAULT 1,
      user_agent  VARCHAR(500),
      ip_address  VARCHAR(100)
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_v_email       ON visitors (email)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_v_first_visit ON visitors (first_visit)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_v_last_visit  ON visitors (last_visit)`);
  console.log('✓ visitors');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id          SERIAL PRIMARY KEY,
      slot        VARCHAR(50)   NOT NULL UNIQUE,
      src         VARCHAR(200),
      caption     VARCHAR(200)  NOT NULL,
      emoji       VARCHAR(20)   NOT NULL,
      bg_gradient VARCHAR(300)  NOT NULL,
      sort_order  INT           NOT NULL DEFAULT 0,
      uploaded_at TIMESTAMP
    )
  `);
  console.log('✓ gallery_photos');

  // Seed gallery slots (skip if already present)
  const slots = [
    ['g-workshop',      null,                'Workshop & Tech Inventory',           '🔧', 'linear-gradient(135deg,rgba(37,99,235,0.1),rgba(124,58,237,0.12))',  1],
    ['g-repair-1',      null,                'Laptop Motherboard Repair',           '💻', 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.12))',  2],
    ['g-screen-repair', null,                'Screen Replacement Work',             '🖥', 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(37,99,235,0.08))',  3],
    ['g-shop',          null,                'Our Shop – Near VBSPU, Jaunpur',      '🏪', 'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(124,58,237,0.08))', 4],
    ['g-counter',       null,                'Service Counter & Display',           '🖥', 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(124,58,237,0.08))', 5],
    ['g-components',    null,                'Computer Components & RAM',           '🔩', 'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(37,99,235,0.08))',   6],
    ['g-disassembly',   null,                'Complete Laptop Disassembly',         '⚙',  'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(16,185,129,0.08))', 7],
    ['vikram',          'images/vikram.jpg', 'Vikram – Founder & Lead Technician',  '👨‍💻', 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(37,99,235,0.12))', 8],
    ['g-repair-2',      null,                'Expert Laptop Repair Service',        '🛠',  'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(245,158,11,0.08))', 9],
  ];

  for (const [slot, src, caption, emoji, bg_gradient, sort_order] of slots) {
    await pool.query(
      `INSERT INTO gallery_photos (slot, src, caption, emoji, bg_gradient, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slot) DO NOTHING`,
      [slot, src, caption, emoji, bg_gradient, sort_order]
    );
  }
  console.log('✓ gallery_photos seeded');

  // Create admin user (skip if already exists)
  const adminEmail = 'vrjalalpur@gmail.com';
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (existing.rows.length === 0) {
    const hashed = await bcrypt.hash('go@Gle#1007', 12);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['Admin', adminEmail, hashed, 'admin']
    );
    console.log('✓ admin user created');
  } else {
    console.log('✓ admin user already exists');
  }

  console.log('\n✅ All tables ready.');
  await pool.end();
  process.exit(0);
}

migrate().catch(e => {
  console.error('❌ Migration failed:', e.message);
  process.exit(1);
});

const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const c = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false }
  });
  console.log('Connected to MySQL');

  await c.execute(`
    CREATE TABLE IF NOT EXISTS gallery_photos (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      slot        VARCHAR(50)  NOT NULL UNIQUE,
      src         VARCHAR(200) NULL,
      caption     VARCHAR(200) NOT NULL,
      emoji       VARCHAR(20)  NOT NULL,
      bg_gradient VARCHAR(300) NOT NULL,
      sort_order  INT          NOT NULL DEFAULT 0,
      uploaded_at DATETIME     NULL
    )
  `);
  console.log('Table ready');

  const slots = [
    ['g-workshop',     null,               'Workshop & Tech Inventory',          '🔧', 'linear-gradient(135deg,rgba(37,99,235,0.1),rgba(124,58,237,0.12))',  1],
    ['g-repair-1',     null,               'Laptop Motherboard Repair',          '💻', 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(37,99,235,0.12))',  2],
    ['g-screen-repair',null,               'Screen Replacement Work',            '🖥', 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(37,99,235,0.08))',  3],
    ['g-shop',         null,               'Our Shop – Near VBSPU, Jaunpur',     '🏪', 'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(124,58,237,0.08))', 4],
    ['g-counter',      null,               'Service Counter & Display',          '🖥', 'linear-gradient(135deg,rgba(239,68,68,0.08),rgba(124,58,237,0.08))', 5],
    ['g-components',   null,               'Computer Components & RAM',          '🔩', 'linear-gradient(135deg,rgba(6,182,212,0.1),rgba(37,99,235,0.08))',   6],
    ['g-disassembly',  null,               'Complete Laptop Disassembly',        '⚙', 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(16,185,129,0.08))', 7],
    ['vikram',         'images/vikram.jpg','Vikram – Founder & Lead Technician', '👨‍💻', 'linear-gradient(135deg,rgba(124,58,237,0.12),rgba(37,99,235,0.12))', 8],
    ['g-repair-2',     null,               'Expert Laptop Repair Service',       '🛠', 'linear-gradient(135deg,rgba(37,99,235,0.08),rgba(245,158,11,0.08))', 9],
  ];

  for (const s of slots) {
    await c.execute(
      'INSERT IGNORE INTO gallery_photos (slot, src, caption, emoji, bg_gradient, sort_order) VALUES (?,?,?,?,?,?)',
      s
    );
  }

  const [rows] = await c.execute('SELECT slot, src, sort_order FROM gallery_photos ORDER BY sort_order');
  console.log('Seeded slots:');
  rows.forEach(r => console.log(` ${r.sort_order}. ${r.slot} = ${r.src || '(empty)'}`));

  await c.end();
  console.log('Done.');
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });

const express  = require('express');
const router   = express.Router();
const path     = require('path');
const fs       = require('fs');
const multer   = require('multer');
const { query } = require('../db');
const { verifyToken, adminOnly } = require('../middleware/auth');

/* GET /api/gallery  — public */
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT slot, src, caption, emoji, bg_gradient, sort_order FROM gallery_photos ORDER BY sort_order ASC'
    );
    res.json({ success: true, photos: result.recordset });
  } catch (err) {
    console.error('Gallery fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to load gallery' });
  }
});

/* POST /api/gallery/upload?slot=g-workshop  — admin only */
const GALLERY_DIR  = path.join(__dirname, '../../public/images/gallery');
if (!fs.existsSync(GALLERY_DIR)) fs.mkdirSync(GALLERY_DIR, { recursive: true });

const ALLOWED_SLOTS = [
  'g-workshop', 'g-repair-1', 'g-screen-repair', 'g-shop',
  'g-counter',  'g-components', 'g-disassembly',  'g-repair-2',
];

const galleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, GALLERY_DIR),
  filename: (req, file, cb) => {
    const slot = (req.query.slot || '').replace(/[^a-z0-9-]/gi, '');
    if (!ALLOWED_SLOTS.includes(slot)) return cb(new Error('Invalid slot name'));
    const ext = /\.(png|gif|webp)$/i.test(file.originalname)
      ? file.originalname.split('.').pop().toLowerCase()
      : 'jpg';
    cb(null, `${slot}.${ext}`);
  },
});

const uploadGallery = multer({
  storage: galleryStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'));
    cb(null, true);
  },
});

router.post('/upload', verifyToken, adminOnly, (req, res) => {
  uploadGallery.single('photo')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const slot = (req.query.slot || '').replace(/[^a-z0-9-]/gi, '');
    const src  = `images/gallery/${req.file.filename}`;

    try {
      await query(
        'UPDATE gallery_photos SET src = ?, uploaded_at = NOW() WHERE slot = ?',
        [src, slot]
      );
    } catch (dbErr) {
      console.error('Gallery DB update error:', dbErr.message);
    }

    res.json({ success: true, url: '/' + src });
  });
});

module.exports = router;

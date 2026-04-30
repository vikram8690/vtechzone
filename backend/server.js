const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
require('dotenv').config();
const { verifyToken, adminOnly } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------
   REDIRECT: any *.html URL → clean URL  (301 permanent)
   Must be placed BEFORE express.static so static never
   serves .html files directly.
   Examples:
     /index.html    → /
     /services.html → /services
     /login.html    → /login
------------------------------------------------------- */
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    let clean = req.path.slice(0, -5); // strip .html
    if (clean === '/index' || clean === '') clean = '/';
    return res.redirect(301, clean);
  }
  next();
});

/* strip trailing slashes (except root) */
app.use((req, res, next) => {
  if (req.path !== '/' && req.path.endsWith('/')) {
    return res.redirect(301, req.path.slice(0, -1));
  }
  next();
});

/* -------------------------------------------------------
   Static assets: CSS, JS, images — NOT .html files
   redirect:false prevents /blog → /blog/ when blog/ dir exists
------------------------------------------------------- */
app.use(express.static(path.join(__dirname, '../public'), { redirect: false }));

/* -------------------------------------------------------
   API Routes
------------------------------------------------------- */
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/services', require('./routes/services'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/users',    require('./routes/users'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'vTechZone API is running!' });
});

/* -------------------------------------------------------
   Gallery photo upload  POST /api/gallery/upload?slot=g-workshop
   Requires: logged-in admin user
------------------------------------------------------- */
const GALLERY_DIR = path.join(__dirname, '../public/images/gallery');
if (!fs.existsSync(GALLERY_DIR)) fs.mkdirSync(GALLERY_DIR, { recursive: true });

const ALLOWED_SLOTS = ['g-workshop','g-repair-1','g-screen-repair','g-shop','g-counter','g-components','g-disassembly','g-repair-2'];

const galleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, GALLERY_DIR),
  filename: (req, file, cb) => {
    const slot = (req.query.slot || '').replace(/[^a-z0-9-]/gi, '');
    if (!ALLOWED_SLOTS.includes(slot)) return cb(new Error('Invalid slot name'));
    const ext = /\.(png|gif|webp)$/i.test(file.originalname)
      ? file.originalname.split('.').pop().toLowerCase()
      : 'jpg';
    cb(null, `${slot}.${ext}`);
  }
});

const uploadGallery = multer({
  storage: galleryStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Images only'));
    cb(null, true);
  }
});

app.post('/api/gallery/upload', verifyToken, adminOnly, (req, res, next) => {
  uploadGallery.single('photo')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const ext = req.file.filename.split('.').pop();
    const slot = (req.query.slot || '').replace(/[^a-z0-9-]/gi, '');
    res.json({ success: true, url: `/images/gallery/${slot}.${ext}` });
  });
});

/* -------------------------------------------------------
   Clean URL page routes (no .html in the browser)
------------------------------------------------------- */
const pages = {
  '/':          'index.html',
  '/services':  'services.html',
  '/projects':  'projects.html',
  '/photos':    'photos.html',
  '/blog':      'blog.html',
  '/contact':   'contact.html',
  '/login':     'login.html',
  '/signup':    'signup.html',
  '/dashboard': 'dashboard.html',
  '/admin':     'admin.html',
};

const blogPosts = {
  '/blog/laptop-speed-tips':       'blog/laptop-speed-tips.html',
  '/blog/ssd-upgrade-guide':       'blog/ssd-upgrade-guide.html',
  '/blog/laptop-overheating-fix':  'blog/laptop-overheating-fix.html',
  '/blog/bca-project-guide':       'blog/bca-project-guide.html',
  '/blog/hard-drive-health-guide': 'blog/hard-drive-health-guide.html',
};

Object.entries({ ...pages, ...blogPosts }).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', file));
  });
});

/* -------------------------------------------------------
   404 fallback — unknown routes go to home
------------------------------------------------------- */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

/* -------------------------------------------------------
   Global error handler
------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 vTechZone server running → http://localhost:${PORT}`);
});
